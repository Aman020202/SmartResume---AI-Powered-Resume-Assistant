import fs from "fs";
import { getAIReview } from "../utils/openai.js";
import { extractTextFromPDF } from "../utils/pdfUtils.js";
import Resume from "../models/resumeModel.js";

export const analyzeResume = async (req, res) => {
  try {
    console.log("Resume upload request received", { user: req.user?._id, file: req.file?.originalname });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const filepath = req.file.path;
    let resumeText;
    try {
      resumeText = await extractTextFromPDF(filepath);
    } catch (error) {
      console.error("PDF extraction failed:", error);
      return res.status(500).json({ message: "Failed to extract text from PDF", detail: error.message });
    }

    let aiFeedback;
    try {
      aiFeedback = await getAIReview(resumeText);
    } catch (error) {
      console.error("AI review failed in analyzeResume:", error);
      aiFeedback = {
        score: 0,
        summary:
          "AI review is currently unavailable. Your resume text was extracted successfully.",
        pros: [],
        cons: ["AI service unavailable. Please try again later."],
        suggestions: [
          "Resume text extraction succeeded, but AI feedback could not be generated.",
        ],
      };
    }

    const resumeUrl = `${req.protocol}://${req.get("host")}/${filepath.replace(
      /\\/g,
      "/"
    )}`;

    const newResumeEntry = new Resume({
      originalText: resumeText,
      aiFeedback,
      originalFileName: req.file.originalname,
      user: req.user._id,
    });
    await newResumeEntry.save();

    res.status(200).json({
      resumeText,
      aiFeedback,
      resumeUrl,
    });
  } catch (error) {
    console.error("Resume analysis failed:", error);
    res.status(500).json({ message: error.message || "Failed to analyze resume", stack: error.stack });
  }
};
