import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXTwitter,
  faInstagram,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-0">
        <div className="border-t border-black/5 dark:border-white/5 mt-15"></div>

        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_2fr] gap-10 sm:gap-4 py-12">
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
            <h2 className="text-xl font-bold">
              exchan<span className="text-[#256F5C]">go</span>
            </h2>
            <p className="text-[0.9375rem] text-black/55 dark:text-gray-300 leading-relaxed whitespace-pre-line max-w-[22ch] md:max-w-none">
              {t("footer.value")}
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-col items-center space-y-3">
            <h3 className="font-semibold text-[0.9375rem]">
              {t("footer.links.title")}
            </h3>
            <ul className="space-y-2 text-center text-[0.9375rem] text-black/55 dark:text-gray-300">
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-[#256F5C] transition-colors duration-150"
                >
                  {t("footer.links.howItWorks")}
                </a>
              </li>
              <li>
                <a
                  href="#converter"
                  className="hover:text-[#256F5C] transition-colors duration-150"
                >
                  {t("footer.links.converter")}
                </a>
              </li>
              <li>
                <a
                  href="mailto:ezekielarkohamissah@gmail.com"
                  className="hover:text-[#256F5C] transition-colors duration-150"
                >
                  {t("footer.links.contact")}
                </a>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div className="flex flex-col items-center space-y-3">
            <h3 className="font-semibold text-[0.9375rem]">
              {t("footer.socials")}
            </h3>
            <div className="flex items-center gap-1">
              <a
                href="https://x.com/devzeke146"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our X (formerly Twitter) page"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-black/50 dark:text-gray-400 hover:text-[#256F5C] hover:bg-[#256F5C]/8 transition-all duration-150"
              >
                <FontAwesomeIcon
                  icon={faXTwitter}
                  className="text-[1.1875rem]"
                />
              </a>
              <a
                href="https://instagram.com/zeke.146/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Instagram page"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-black/50 dark:text-gray-400 hover:text-[#256F5C] hover:bg-[#256F5C]/8 transition-all duration-150"
              >
                <FontAwesomeIcon
                  icon={faInstagram}
                  className="text-[1.1875rem]"
                />
              </a>
              <a
                href="https://github.com/zeke614/exchango.git"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View project on GitHub"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-black/50 dark:text-gray-400 hover:text-[#256F5C] hover:bg-[#256F5C]/8 transition-all duration-150"
              >
                <FontAwesomeIcon icon={faGithub} className="text-[1.1875rem]" />
              </a>
            </div>
          </div>

          <div className="hidden sm:flex text-end text-[0.96875rem] text-black/60 dark:text-gray-200 whitespace-pre-line">
            {t("footer.disclaimer")}
          </div>
        </div>

        <div className="flex sm:hidden items-center justify-center text-center text-[0.96875rem] pb-10 text-black/60 dark:text-gray-200 px-4 whitespace-pre-line">
          {t("footer.disclaimer")}
        </div>

        <div className="border-t border-black/6 dark:border-white/6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[0.875rem] text-black/60 dark:text-gray-300">
          <p className="flex items-center gap-1.5">
            <span>&copy; {new Date().getFullYear()}</span>
            <span className="font-bold text-[0.9375rem] text-black/65 dark:text-gray-300">
              exchan<span className="text-[#256F5C]">go</span>
            </span>
            <span> All rights reserved</span>
          </p>

          <p>
            {t("footer.builder")}
            <a
              href="https://github.com/zeke614"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold ml-1 text-[#256F5C] underline underline-offset-2"
            >
              Ezekiel
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
