import Link from "next/link";

import { FacebookIcon, InstagramIcon } from "@/components/icons";

const FACEBOOK_URL = "https://www.facebook.com/fitsapparel.ceb";
const INSTAGRAM_URL = "https://www.instagram.com/fitsapparel.ceb/";
const MAP_URL =
  "https://maps.google.com/?q=Basak%2C+Sudtunggan+across+St+Yves%2C+Lapu-Lapu%2C+Philippines%2C+6015";
const PHONE_NUMBER = "0906-241-8073";
const EMAIL = "fitsapparel.ceb@gmail.com";

export function Footer() {
  return (
    <footer className="border-t border-black/15 bg-white px-6 py-8 md:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3 text-xl font-semibold text-black md:text-3xl">
          <Link
            className="inline-flex items-center gap-3 transition-opacity hover:opacity-70"
            href={FACEBOOK_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            <FacebookIcon className="h-5 w-5 md:h-7 md:w-7" />
          </Link>
          <Link
            className="inline-flex items-center gap-3 transition-opacity hover:opacity-70"
            href={INSTAGRAM_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            <InstagramIcon className="h-5 w-5 md:h-7 md:w-7" />
          </Link>

          <div className="pt-2 text-sm font-medium leading-6 text-black/85 md:text-base">
            <p>
              <Link
                className="underline-offset-4 hover:underline"
                href={MAP_URL}
                rel="noopener noreferrer"
                target="_blank"
              >
                Basak, Sudtunggan across St Yves, Lapu-Lapu, Philippines, 6015
              </Link>
            </p>
            <p>{PHONE_NUMBER}</p>
            <p>{EMAIL}</p>
          </div>
        </div>

        <div className="text-left text-sm font-semibold leading-7 text-black md:text-right md:text-xl md:leading-[1.35]">
          <p>&copy; Fits Apparel</p>
          <p>Est. 2020</p>
        </div>
      </div>
    </footer>
  );
}