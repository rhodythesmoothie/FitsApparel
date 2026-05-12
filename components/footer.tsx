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
    <footer className="border-t border-black/15 bg-white px-6 py-12 md:px-10 md:py-16">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-12">
          {/* Social Links Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Follow Us</h3>
            <div className="flex gap-4">
              <Link
                className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-black text-white transition-opacity hover:opacity-70"
                href={FACEBOOK_URL}
                rel="noopener noreferrer"
                target="_blank"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-5 w-5" />
              </Link>
              <Link
                className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-black text-white transition-opacity hover:opacity-70"
                href={INSTAGRAM_URL}
                rel="noopener noreferrer"
                target="_blank"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Contact Us</h3>
            <div className="space-y-2 text-sm md:text-base text-black/75">
              <p>
                <Link
                  className="underline-offset-4 hover:underline font-medium text-black"
                  href={MAP_URL}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Basak, Sudtunggan
                </Link>
              </p>
              <p className="text-black/70">across St Yves, Lapu-Lapu, Philippines, 6015</p>
              <p className="pt-2">
                <Link
                  className="underline-offset-4 hover:underline font-medium text-black"
                  href={`tel:${PHONE_NUMBER.replace(/-/g, "")}`}
                >
                  {PHONE_NUMBER}
                </Link>
              </p>
              <p>
                <Link
                  className="underline-offset-4 hover:underline font-medium text-black"
                  href={`mailto:${EMAIL}`}
                >
                  {EMAIL}
                </Link>
              </p>
            </div>
          </div>

          {/* Brand Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Brand</h3>
            <div className="space-y-1 text-sm md:text-base text-black/75">
              <p className="font-medium text-black">Fits Apparel</p>
              <p>Est. 2020</p>
              <p>Style with Attitude</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-black/10 pt-8 text-center text-sm text-black/60">
          <p>&copy; 2020 - {new Date().getFullYear()} Fits Apparel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}