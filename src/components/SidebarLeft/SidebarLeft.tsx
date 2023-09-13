import Link from "next/link";
import Image from "next/image";

import { SidebarMenu } from "@/components";

const SidebarLeft = () => {
  return (
    <div className="flex flex-1 justify-end">
      <div className="hidden xl:block fixed h-screen w-64 p-4 md:px-8">
        <SidebarMenu />
      </div>

      <div className="hidden min-[826px]:block xl:hidden fixed h-screen p-4">
        <div className="flex items-center justify-center h-[44px] mb-4">
          <Link href="/" className="inline-block">
            <Image
              src="/onchainreads.png"
              alt="Onchain Reads Logo"
              width={32}
              height={32}
            />
          </Link>
        </div>

        <ul className="mt-3">
          <li>
            <a
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 font-medium text-lg text-slate-700 hover:text-slate-900 transition"
              href="https://github.com/matallo/onchain-reads"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
                  stroke="#4b5563"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.375 9.375H10V13.75H10.625"
                  stroke="#4b5563"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.84375 7.5C10.3615 7.5 10.7812 7.08027 10.7812 6.5625C10.7812 6.04473 10.3615 5.625 9.84375 5.625C9.32598 5.625 8.90625 6.04473 8.90625 6.5625C8.90625 7.08027 9.32598 7.5 9.84375 7.5Z"
                  fill="#4b5563"
                />
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SidebarLeft;
