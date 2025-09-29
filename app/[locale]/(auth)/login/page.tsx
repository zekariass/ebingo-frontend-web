'use client';

import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/use-session';
import i18n from '@/i18n';
import { useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const {user, session} = useSession();

    if (user) {
        window.location.href = "/"
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/${i18n.language}/api/auth/login`, {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Login failed');
            } else {
                // Redirect to dashboard or home
                window.location.href = '/';
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full border shadow-lg shadow-md rounded-xl p-8 space-y-6">
                <h1 className="text-2xl font-bold text-center text-white">
                    Bingo
                </h1>
                <p className="text-sm text-white text-center">
                    Enter your credentials to access the games
                </p>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <label className="flex flex-col text-white">
                        <span className="mb-1 font-medium">Email</span>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </label>

                    <label className="flex flex-col text-white">
                        <span className="mb-1 font-medium">Password</span>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </label>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3  text-white font-semibold rounded-lg disabled:opacity-50 transition cursor-pointer"
                    >
                        {loading ? 'Logging in…' : 'Login'}
                    </Button>

                    {error && (
                        <p className="text-red-500 text-center text-sm mt-2">{error}</p>
                    )}
                </form>

                <p className="text-sm text-white text-center">
                    Don’t have an account?{' '}
                    <a
                        href="/signup"
                        className="text-blue-600 hover:underline font-medium"
                    >
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
}
