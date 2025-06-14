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
    <footer className="bg-white space-y-5 pt-20">
      <div className="border-t border-[#0000001f] pb-7 mx-6"></div>

      <h1 className="text-[1.5625rem] text-center font-medium mb-3 ml-6">
        exchan<span className="text-[#256F5C]">go</span>
      </h1>

      <p className="text-center text-[1.0625rem] text-gray-500 mb-12 whitespace-pre-line">
        {t("footer.value")}
      </p>

      <div className="flex flex-col items-center space-y-2">
        <h4 className="font-medium text-gray-800 text-[1.15625rem]">
          {t("footer.links.title")}
        </h4>
        <ul className="text-gray-500 text-[1.0625rem] gap-3 flex justify-center flex-wrap">
          <li>
            <a href="#how-it-works" className="hover:underline">
              {t("footer.links.howItWorks")}
            </a>
          </li>
          <li>
            <a href="#converter" className="hover:underline">
              {t("footer.links.converter")}
            </a>
          </li>
          <li>
            <a
              href="mailto:ezekielarkohamissah@gmail.com"
              className="hover:underline"
            >
              {t("footer.links.contact")}
            </a>
          </li>
        </ul>
      </div>

      <div className="text-center pb-3">
        <h4 className="font-medium text-gray-800 text-[1.15625rem]">
          {t("footer.socials")}
        </h4>
        <div className="gap-1.5 mt-2 items-center justify-center flex">
          <a
            href="https://x.com/zekecodes"
            target="_blank"
            aria-label="Visit our X(formally twitter) page"
            className="w-[2rem] h-[2.25rem] flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faXTwitter} className="text-[1.375rem]" />
          </a>
          <a
            href=""
            target="_blank"
            aria-label="Visit our Instagram page"
            className="w-[2rem] h-[2.25rem] flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faInstagram} className="text-[1.375rem]" />
          </a>
          <a
            href="https://github.com/zeke614/exchango.git"
            target="_blank"
            aria-label="View project on Github"
            className="w-[2rem] h-[2.25rem] flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faGithub} className="text-[1.375rem]" />
          </a>
        </div>
      </div>

      <div className="text-center text-[0.96875rem] text-gray-500 px-4 whitespace-pre-line">
        {t("footer.disclaimer")}
      </div>

      <div className="flex flex-col items-center justify-center text-[1.0625rem] pt-5 pb-4">
        <p className="gap-1.5 mb-0 text-gray-500 flex justify-center items-center">
          <span>&copy;</span> <span>{new Date().getFullYear()}</span>
          <span>
            exchan<span className="text-[#256F5C]">go</span>, Inc.
          </span>
        </p>
        <span className="text-gray-500">
          {t("footer.builder")}
          <a
            href="https://github.com/zeke614"
            target="_blank"
            className="font-medium ml-1 text-[#256F5C] text-[1.09375rem] underline underline-offset-2"
          >
            Ezekiel
          </a>
        </span>
      </div>
    </footer>
  );
}
