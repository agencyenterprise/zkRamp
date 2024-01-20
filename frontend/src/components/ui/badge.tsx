
export default function Badge({ children }: { children: string }) {
    return <div className="w-[57px] h-5 px-2.5 py-0.5 bg-emerald-100 rounded-[10px] justify-center items-center inline-flex">
        <span className="text-center text-emerald-800 text-xs font-medium font-inter leading-none">Badge</span>
    </div>
};
