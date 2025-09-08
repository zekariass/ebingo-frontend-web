'use client';

export default function SignupButton() {
    return (
        <button
            onClick={() => {
                window.location.href = "/signup";
            }}
            className="bg-primary text-white px-4 py-2 rounded"
        >
            Register
        </button>
    );
}