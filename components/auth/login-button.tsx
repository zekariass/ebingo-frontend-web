'use client';

export default function LoginButton() {
    return (
        <button
            onClick={() => {
                window.location.href = "/login";
            }}
            className="bg-primary text-white px-4 py-2 rounded"
        >
            Login
        </button>
    );
}