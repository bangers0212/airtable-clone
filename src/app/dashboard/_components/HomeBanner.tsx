import Image from "next/image";

export default function HomeBanner() {
  return (
    <div className="mb-3 min-h-[150px] w-full min-w-[450px] rounded-lg border-1 border-gray-300 bg-[#f1f5ff] px-[32px] py-[24px] shadow">
      <div className="space mb-1 flex justify-between">
        <div className="font-sans text-lg font-light">
          Upgrade to the Team plan before your trial expires in{" "}
          <span className="text-blue-500">13 days</span>
        </div>
        <button className="group relative mt-[-20] mr-[-15] min-h-[16px] min-w-[16px] cursor-pointer">
          <Image
            src="/images/X.svg"
            width={16}
            height={16}
            alt=""
            unoptimized
            priority
          />
          <span
            className="mr-1/2 absolute right-[-20px] mt-1.5 hidden rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block"
            aria-hidden="true"
          >
            Dismiss
          </span>
        </button>
      </div>
      <div className="text-sm">
        Keep the power you need to manage complex workflows, design interfaces,
        and more.
      </div>
      <div className="mt-4 flex gap-5">
        <button className="flex h-[36px] min-w-[153px] cursor-pointer items-center gap-2 rounded-[18px] bg-black px-[32px] text-white">
          <Image
            src="/images/airtable-plus-fill.svg"
            width={16}
            height={16}
            alt="upgrade plans icon"
            unoptimized
            priority
          />
          <span>Upgrade</span>
        </button>
        <button className="flex h-[36px] min-w-[153px] cursor-pointer items-center gap-2 rounded-[18px] px-[10px] text-gray-500 hover:bg-gray-200">
          <Image
            src="/images/arrows-left-right.svg"
            width={16}
            height={16}
            alt="switch plans icon"
            unoptimized
            priority
          />
          <span>Compare plans</span>
        </button>
      </div>
    </div>
  );
}
