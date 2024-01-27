

export default function Modal({ children }: { children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center w-full h-full overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
        <div className="relative w-auto max-w-3xl mx-auto my-6">
            <div className="relative flex flex-col w-full border-0 rounded-lg shadow-lg outline-none focus:outline-none">
            {children}
            </div>
        </div>
        </div>
    );
    
};
