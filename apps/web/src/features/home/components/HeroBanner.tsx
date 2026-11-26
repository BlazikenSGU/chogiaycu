export default function HeroBanner() {
  return (
    <section className="relative mb-9 overflow-hidden rounded-[28px] bg-[#eeeeee]">
      <div className="relative z-10 flex min-h-56 w-[62%] flex-col justify-center p-4 md:min-h-80 md:p-12">
        <span className="mb-2 text-2xl font-extrabold tracking-tight md:text-4xl">
          Giày đá bóng
        </span>

        <h2 className="mb-3 text-lg font-bold md:text-2xl">
          Giày new, giày 2hand đều có.
        </h2>

        <p className="mb-5 max-w-xs text-xs text-neutral-600 md:text-sm">
          Xuất phát điểm từ sinh viên, mong muốn có được
          những đôi giày chính hãng giá cả vừa phải để chơi.
        </p>
      </div>

      <img
        src="/images/home/hero-shoes.webp"
        alt="Giày đá bóng 72Market"
        className="absolute bottom-0 right-[-6%] h-[85%] w-[58%] object-contain md:right-0 md:h-full"
      />
    </section>
  );
}