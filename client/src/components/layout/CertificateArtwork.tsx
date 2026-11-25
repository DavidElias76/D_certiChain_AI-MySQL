import { Landmark } from "lucide-react";

interface CertificateArtworkData {
  student_name: string;
  institution_name: string;
  course: string;
  degree: string;
  graduation_date: string;
  certificate_number: string;
}

export default function CertificateArtwork({
  certificate,
}: {
  certificate: CertificateArtworkData;
}) {
    const graduationYear = new Date(certificate.graduation_date).getUTCFullYear();

  return (
    <div className="relative aspect-[1.42/1] overflow-hidden bg-[#fdfaf2] p-2 shadow-sm sm:p-3">
      <div className="h-full border-[5px] border-double border-[#1e3a8a] p-1.5 sm:border-[7px] sm:p-2">
        <div className="relative flex h-full flex-col items-center justify-center border border-[#1e3a8a]/70 px-3 text-center text-slate-800 sm:px-6">
          <span className="absolute left-1 top-1 h-3 w-3 border-l border-t border-[#1e3a8a]" />
          <span className="absolute right-1 top-1 h-3 w-3 border-r border-t border-[#1e3a8a]" />
          <span className="absolute bottom-1 left-1 h-3 w-3 border-b border-l border-[#1e3a8a]" />
          <span className="absolute bottom-1 right-1 h-3 w-3 border-b border-r border-[#1e3a8a]" />
          <div className="mb-2 flex h-8 w-8 items-center justify-center border-2 border-[#1e3a8a] text-[#1e3a8a] sm:mb-3 sm:h-10 sm:w-10">
            <Landmark size={20} strokeWidth={1.6} />
          </div>
          <p className="max-w-full truncate text-[10px] font-bold uppercase tracking-[0.18em] text-[#1e3a8a] sm:text-sm sm:tracking-[0.25em]">
            {certificate.institution_name}
          </p>
          <p className="mt-1 text-[7px] font-semibold uppercase tracking-[0.35em] text-[#1e3a8a] sm:text-[9px]">Academic certificate</p>
          <p className="mt-3 text-[8px] italic sm:mt-5 sm:text-[10px]">This is to certify that</p>
          <p className="mt-1 max-w-full truncate font-serif text-lg italic sm:text-2xl">{certificate.student_name}</p>
          <p className="mt-1 text-[8px] sm:text-[10px]">has successfully completed the requirements for</p>
          <p className="mt-1 max-w-full text-[10px] font-bold sm:text-sm">{certificate.course}</p>
          <p className="mt-1 text-[8px] text-[#1e3a8a] sm:text-[10px]">{certificate.degree} · {graduationYear}</p>
          <p className="mt-2 max-w-full truncate font-mono text-[6px] text-[#1e3a8a] sm:text-[8px]">
            CERTIFICATE NUMBER · {certificate.certificate_number}
          </p>
        </div>
      </div>
    </div>
  );
}
