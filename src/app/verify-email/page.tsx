import { RunClubLogo } from "@/components/RunClubLogo";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1B1C1E] px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <RunClubLogo size="lg" />
        <div className="text-5xl">📬</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Revisa tu correo</h1>
          <p className="text-[#B8B8B8] leading-relaxed">
            Te enviamos un link de confirmación. Haz click en él para activar tu cuenta y empezar a entrenar.
          </p>
        </div>
        <div className="rounded-xl border border-[#F16823]/20 bg-[#F16823]/5 px-5 py-4 text-left space-y-2">
          <p className="text-sm font-medium text-[#F16823]">¿No ves el correo?</p>
          <ul className="text-sm text-[#B8B8B8] space-y-1">
            <li>• Revisa tu carpeta de <span className="text-white font-medium">spam o correo no deseado</span></li>
            <li>• Busca un correo de <span className="text-white font-medium">noreply@runclubpty.com</span></li>
            <li>• Puede tardar hasta 2 minutos en llegar</li>
          </ul>
        </div>
        <p className="text-xs text-[#B8B8B8]/50">
          Una vez confirmado tu correo, puedes iniciar sesión normalmente.
        </p>
      </div>
    </main>
  );
}
