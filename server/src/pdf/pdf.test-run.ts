import { generateCertificatePdf } from "./pdf.generator";
import { savePdf } from "./pdf.storage";

// used to check if the saving works - it doesnot need to be runned just it check if the storage works
(async () => {
  const buf = await generateCertificatePdf({
    certificate_number: "JKU-2026-A1B2C3D4",
    student_name: "Jane Wanjiru",
    institution_name: "JU University",
    course: "Computer Science",
    degree: "Bachelor of Science",
    graduation_date: "2026-07-15",
    gpa: "3.8",
    classification: "First Class Honours",
  });
  console.log(await savePdf(999999, buf));
})();