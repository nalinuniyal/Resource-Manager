import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Zap } from "lucide-react";
import { signInWithPassword, signUpWithPassword } from "@/lib/api";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  fullName: z.string().optional(),
});

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", fullName: "" },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    if (isSignUp) {
      const { error } = await signUpWithPassword(values.email, values.password, values.fullName);
      if (error) toast.error(error.message);
      else toast.success("Account created! Check your email to confirm.");
    } else {
      const { error } = await signInWithPassword(values.email, values.password);
      if (error) toast.error(error.message);
    }
    setLoading(false);
  };

  const inputClass = "glass-input w-full px-4 py-3 text-sm";

  return (
    <div className="w-full max-w-sm">
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-200 leading-tight">Resource Manager</h1>
            <p className="text-xs text-slate-600">{isSignUp ? "Create your account" : "Sign in to continue"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isSignUp && (
            <div>
              <input {...register("fullName")} placeholder="Full name" className={inputClass} />
            </div>
          )}
          <div>
            <input {...register("email")} type="email" placeholder="Email address" className={inputClass} />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <input {...register("password")} type="password" placeholder="Password" className={inputClass} />
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50 glow-blue">
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
