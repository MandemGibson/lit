import React from "react";
import { Link } from "react-router-dom";
import { RxGithubLogo } from "react-icons/rx";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#09090b] py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center justify-between gap-4 text-xs text-zinc-500">
        <h1 className="text-6xl sm:text-8xl md:text-[10vw] lg:text-[11vw] font-black tracking-tighter text-center bg-gradient-to-b from-white via-zinc-200 to-zinc-700 bg-clip-text text-transparent select-none w-full leading-none mb-4">
          LIT ENVS
        </h1>

        <div className="flex space-x-6">
          <Link to="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://github.com/MandemGibson/lit"
            className="hover:text-white transition-colors flex items-center"
          >
            <RxGithubLogo className="mr-1.5 h-3.5 w-3.5" /> GitHub
          </a>
        </div>

        <div className="text-[11px] text-zinc-650">
          © 2026 Lit Envs. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
