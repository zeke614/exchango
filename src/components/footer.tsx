import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXTwitter,
  faFacebook,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { useTranslation } from "react-i18next";
//import xG from "../assets/xG.png";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white space-y-6 mt-16 pt-[70px] border-t border-[#0000001f] mx-3.5">
      {/*<div className="flex items-center justify-center !bg-none">
        <img src={xG} alt="xG-logo" className="w-24 bg-none" />
      </div>*/}
      <h1 className="text-center text-[40px] pb-4 font-medium font-[cursive]">
        x<span className="text-[#256F5C]">G</span>
      </h1>

      <p className="text-center text-[19px] text-gray-500 whitespace-pre-line">
        {t("footer.value")}
      </p>

      <div className="flex flex-col items-center space-y-2">
        <h4 className="font-medium text-gray-800 text-[21px]">
          {t("footer.links.title")}
        </h4>
        <ul className="text-gray-500 text-[19px] gap-3 flex justify-center flex-wrap">
          <li>
            <a href="#how-it-works" className="hover:underline">
              {t("footer.links.howItWorks")}{" "}
            </a>
          </li>
          <li>
            <a href="#converter" className="hover:underline">
              {t("footer.links.converter")}{" "}
            </a>
          </li>
          <li>
            <a
              href="mailto:ezekielarkohamissah@gmail.com"
              className="hover:underline"
            >
              {t("footer.links.contact")}{" "}
            </a>
          </li>
        </ul>
      </div>

      <div className="text-center pb-3">
        <h4 className="font-medium text-gray-800 text-[21px]">
          {t("footer.socials")}
        </h4>
        <div className="gap-1.5 mt-2 items-center justify-center flex">
          <a
            href="https://x.com/zekecodes"
            target="_blank"
            className="w-8 h-9 flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faXTwitter} className="text-[22px]" />
          </a>
          <a
            href=""
            target="_blank"
            className="w-8 h-9 flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faFacebook} className="text-[22px]" />
          </a>
          <a
            href=""
            target="_blank"
            className="w-8 h-9 flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faInstagram} className="text-[22px]" />
          </a>
        </div>
      </div>

      <div className="text-center text-lg text-gray-500 px-4 whitespace-pre-line">
        {t("footer.disclaimer")}
      </div>

      <div className="flex flex-col items-center justify-center py-5">
        <p className="gap-1.5 text-[19px] mb-0 text-gray-500 flex justify-center items-center">
          <span>&copy;</span> <span>{new Date().getFullYear()}</span>
          <span>
            exchan<span className="text-[#256F5C]">go</span>, Inc.
          </span>{" "}
        </p>
        <span className="text-[19px] text-gray-500">
          {t("footer.builder")}
          <a
            href="https://github.com/zeke614"
            target="_blank"
            className="font-medium ml-1 text-gray-800 hover:underline"
          >
            Ezekiel
          </a>
        </span>
      </div>
    </footer>
  );
}
