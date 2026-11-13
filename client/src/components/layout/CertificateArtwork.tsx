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
    <div className="relative aspect-[1.42/1] overflow-hidden bg-[#fbf7e9] p-2 shadow-sm sm:p-3">
      <div className="h-full border-[5px] border-double border-[#b58b3d] p-1.5 sm:border-[7px] sm:p-2">
        <div className="relative flex h-full flex-col items-center justify-center border border-[#d5b96f] px-3 text-center text-[#1c3151] sm:px-6">
          <span className="absolute left-1 top-1 h-3 w-3 border-l border-t border-[#b58b3d]" />
          <span className="absolute right-1 top-1 h-3 w-3 border-r border-t border-[#b58b3d]" />
          <span className="absolute bottom-1 left-1 h-3 w-3 border-b border-l border-[#b58b3d]" />
          <span className="absolute bottom-1 right-1 h-3 w-3 border-b border-r border-[#b58b3d]" />
          <div className="mb-2 flex h-8 w-8 items-center justify-center border-2 border-[#b58b3d] text-[#b58b3d] sm:mb-3 sm:h-10 sm:w-10">
            <Landmark size={20} strokeWidth={1.6} />
          </div>
          <p className="max-w-full truncate text-[10px] font-bold uppercase tracking-[0.18em] sm:text-sm sm:tracking-[0.25em]">
            {certificate.institution_name}
          </p>
          <p className="mt-1 text-[7px] font-semibold uppercase tracking-[0.35em] text-[#8b7444] sm:text-[9px]">Academic certificate</p>
          <p className="mt-3 text-[8px] italic sm:mt-5 sm:text-[10px]">This is to certify that</p>
          <p className="mt-1 max-w-full truncate font-serif text-lg italic sm:text-2xl">{certificate.student_name}</p>
          <p className="mt-1 text-[8px] sm:text-[10px]">has successfully completed the requirements for</p>
          <p className="mt-1 max-w-full text-[10px] font-bold sm:text-sm">{certificate.course}</p>
          <p className="mt-1 text-[8px] text-[#8b7444] sm:text-[10px]">{certificate.degree} · {graduationYear}</p>
          <div className="mt-3 flex w-full items-end justify-between gap-2 sm:mt-5">
            <div className="w-1/3 border-t border-[#a88a53] pt-1 text-[6px] text-[#65728a] sm:text-[8px]">Registrar</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#b58b3d] text-[9px] font-bold text-[#b58b3d] sm:h-12 sm:w-12 sm:text-xs">CC</div>
            <div className="w-1/3 border-t border-[#a88a53] pt-1 text-[6px] text-[#65728a] sm:text-[8px]">Institution</div>
          </div>
          <p className="mt-2 max-w-full truncate font-mono text-[6px] text-[#8b7444] sm:text-[8px]">
            CERTIFICATE NUMBER · {certificate.certificate_number}
          </p>
        </div>
      </div>
    </div>
  );
}
