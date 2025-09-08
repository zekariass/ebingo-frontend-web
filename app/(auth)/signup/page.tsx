"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupFormData } from "@/lib/validation/signup-validation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import debounce from "lodash.debounce";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Replace } from "lucide-react";


const supabase = supabaseBrowser();


const calculatePasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return score;
};

export default function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailError, setEmailError] = useState("");

  const [emailAvailable, setEmailAvailable] = useState(true);
  const [nicknameAvailable, setNicknameAvailable] = useState(true);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const passwordValue = watch("password", "");
  const emailValue = watch("email", "");
  const nicknameValue = watch("nickName", "");

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(passwordValue));
  }, [passwordValue]);

  const onSubmit = async (data: SignupFormData) => {
    if (!emailAvailable || !nicknameAvailable) {
      setError("Email or nickname is already taken");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Signup failed");

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrengthColor = ["bg-red-500", "bg-red-500", "bg-orange-400","bg-yellow-400","bg-green-500"][passwordStrength] || "bg-red-500";

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {(["firstName","lastName","nickName","email","password","phone"] as (keyof SignupFormData)[]).map((field) => (
          <div key={field}>
            <label className="block font-medium capitalize mb-1">{field}</label>
            <input
              type={field === "password" ? "password" : "text"}
              {...register(field)}
              className={`w-full p-2 border rounded focus:ring focus:ring-blue-400 focus:outline-none ${
                errors[field] ? "border-red-500" : ""
              }`}
            />
            {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]?.message}</p>}

            {field === "email" && !emailAvailable && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
            {field === "nickName" && !nicknameAvailable && (
              <p className="text-red-500 text-sm mt-1">Nickname is already taken</p>
            )}

            {field === "password" && passwordValue && (
              <div className="mt-1 h-2 w-full bg-gray-200 rounded">
                <div
                  className={`h-2 rounded ${passwordStrengthColor}`}
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                />
              </div>
            )}
          </div>
        ))}

        {error && <p className="text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading || !emailAvailable || !nicknameAvailable}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <p className="text-sm text-white text-center">
              Have an account?{' '}
              <a
                  href="/login"
                  className="text-blue-600 hover:underline font-medium"
              >
                  Login
              </a>
          </p>
      </form>
    </div>
  );
}
