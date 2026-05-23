export default function FaqButton() {
  const scrollToFaq = () => {
    document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToFaq}
      aria-label="View frequently asked questions"
      className="fixed bottom-[88px] right-6 z-[9999] flex items-center gap-3 bg-[#0D0D0D] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 hover:bg-[#C65D3B] transition-all duration-200"
      style={{ padding: "12px 20px 12px 16px" }}
    >
      <span
        className="w-[22px] h-[22px] rounded-full border-2 border-white flex items-center justify-center text-[13px] font-bold leading-none flex-none"
        aria-hidden="true"
      >
        ?
      </span>
      <span
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        className="text-[13px] font-semibold whitespace-nowrap"
      >
        FAQ
      </span>
    </button>
  );
}
