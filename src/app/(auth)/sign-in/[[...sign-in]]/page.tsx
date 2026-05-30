import { SignIn } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Eye } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-mono">
      <Card className="p-0 border-3 border-black shadow-neo-lg w-full max-w-md overflow-hidden bg-white">
        {/* Header Branding */}
        <div className="bg-neo-yellow border-b-3 border-black p-4 flex items-center justify-center gap-2 select-none">
          <div className="bg-black text-white p-1 border border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            <Eye className="w-5 h-5 text-neo-yellow" />
          </div>
          <span className="font-black text-xl uppercase tracking-wider text-black">
            OBSERVO CONSOLE
          </span>
        </div>
        
        {/* Auth Frame */}
        <div className="p-6 bg-white flex justify-center items-center">
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            appearance={{
              elements: {
                card: 'shadow-none border-0 p-0',
                headerTitle: 'font-mono uppercase font-black text-black',
                headerSubtitle: 'font-mono uppercase text-xs text-zinc-500',
                socialButtonsBlockButton: 'border-2 border-black rounded-none font-bold uppercase hover:bg-slate-50 transition-all font-mono text-xs shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none',
                formButtonPrimary: 'bg-neo-yellow text-black border-2 border-black rounded-none font-black uppercase hover:bg-neo-yellow/90 font-mono shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none text-xs py-2 transition-all',
                formFieldLabel: 'font-mono uppercase font-black text-xs',
                formFieldInput: 'border-2 border-black rounded-none font-mono text-sm focus:ring-0 focus:border-black py-2',
                footerActionText: 'font-mono text-xs uppercase',
                footerActionLink: 'font-mono text-xs uppercase font-black text-black hover:underline'
              }
            }}
          />
        </div>
      </Card>
    </div>
  );
}
