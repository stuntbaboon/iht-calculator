import React from 'react';
import {
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Landmark,
  Gift,
  Heart,
  Briefcase,
  Scale,
} from 'lucide-react';

interface ReferenceLink {
  label: string;
  url: string;
  source: 'GOV.UK' | 'HMRC Manual' | 'Legislation';
}

interface FooterSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  links: ReferenceLink[];
}

const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Nil-Rate Bands & Allowances',
    icon: Landmark,
    description:
      'Every individual receives a standard £325,000 Nil-Rate Band (NRB). An additional £175,000 Residence Nil-Rate Band (RNRB) applies when passing a main residence to direct descendants. Married couples can transfer 100% of unused allowances (up to £1,000,000 combined).',
    links: [
      {
        label: 'How Inheritance Tax works: thresholds & rules',
        url: 'https://www.gov.uk/inheritance-tax',
        source: 'GOV.UK',
      },
      {
        label: 'Residence Nil-Rate Band qualifying guidance',
        url: 'https://www.gov.uk/guidance/inheritance-tax-residence-nil-rate-band',
        source: 'GOV.UK',
      },
      {
        label: 'Transferring unused thresholds between spouses',
        url: 'https://www.gov.uk/guidance/inheritance-tax-transfer-of-threshold',
        source: 'GOV.UK',
      },
      {
        label: 'Transferable Nil-Rate Band (IHTM43000)',
        url: 'https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual/ihtm43000',
        source: 'HMRC Manual',
      },
    ],
  },
  {
    title: '7-Year Rule & Lifetime Gifts',
    icon: Gift,
    description:
      'Lifetime gifts to individuals are Potentially Exempt Transfers (PETs). If you survive 7 years, they become 100% tax-free. If death occurs within 7 years, gifts consume the NRB chronologically first; excess gifts qualify for sliding-scale taper relief.',
    links: [
      {
        label: 'Gifts and exemptions from Inheritance Tax',
        url: 'https://www.gov.uk/inheritance-tax/gifts',
        source: 'GOV.UK',
      },
      {
        label: 'Work out Inheritance Tax due on gifts',
        url: 'https://www.gov.uk/guidance/work-out-inheritance-tax-due-on-gifts',
        source: 'GOV.UK',
      },
      {
        label: 'Lifetime Transfers & Taper Relief (IHTM14000)',
        url: 'https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual/ihtm14000',
        source: 'HMRC Manual',
      },
    ],
  },
  {
    title: 'Charity 36% & £2M Taper',
    icon: Heart,
    description:
      'Gifts to UK registered charities are exempt. Leaving 10% or more of your baseline net estate to charity cuts the headline IHT rate from 40% to 36% (Schedule 1A IHTA 1984). For estates over £2,000,000, the RNRB tapers down by £1 for every £2 of excess value.',
    links: [
      {
        label: 'Official 36% reduced rate calculator',
        url: 'https://www.gov.uk/inheritance-tax-reduced-rate-calculator',
        source: 'GOV.UK',
      },
      {
        label: 'Reduced rate schedule & instructions (IHT430)',
        url: 'https://www.gov.uk/government/publications/inheritance-tax-reduced-rate-of-inheritance-tax-iht430',
        source: 'GOV.UK',
      },
      {
        label: 'Residence Nil-Rate Band tapering (IHTM46030)',
        url: 'https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual/ihtm46030',
        source: 'HMRC Manual',
      },
    ],
  },
  {
    title: 'Reliefs & Future Reforms',
    icon: Briefcase,
    description:
      'Business Property Relief (BPR) and Agricultural Property Relief (APR) provide 50%–100% relief on qualifying assets. Under Autumn Budget 2024 policy announcements, unused defined contribution pensions will be brought into IHT from 6 April 2027.',
    links: [
      {
        label: 'Business Relief for Inheritance Tax',
        url: 'https://www.gov.uk/business-relief-inheritance-tax',
        source: 'GOV.UK',
      },
      {
        label: 'Agricultural Relief on Inheritance Tax',
        url: 'https://www.gov.uk/guidance/agricultural-relief-on-inheritance-tax',
        source: 'GOV.UK',
      },
      {
        label: 'Inheritance Tax on pensions: technical note',
        url: 'https://www.gov.uk/government/publications/inheritance-tax-on-pensions-technical-note',
        source: 'GOV.UK',
      },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white/90 backdrop-blur-xs text-xs text-slate-600 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header / Intro */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Statutory Framework & Official Guidance
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Current UK statutory rules, HMRC manuals, and GOV.UK guidance notes governing inheritance tax calculations.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Updated for 2024–2028 statutory freeze</span>
          </div>
        </div>

        {/* 4-Column Statutory Sections with HMRC / GOV.UK Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 md:grid-rows-[auto_auto_1fr] lg:grid-rows-[auto_auto_1fr]">
          {FOOTER_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="grid grid-rows-subgrid row-span-3 gap-y-3"
              >
                {/* 1. Card Header */}
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <h4>{section.title}</h4>
                </div>

                {/* 2. Card Description */}
                <p className="text-slate-500 leading-relaxed text-[11.5px] min-h-[5.5rem] lg:min-h-[6.25rem]">
                  {section.description}
                </p>

                {/* 3. Official References Section - Aligned horizontally across all columns */}
                <div className="pt-3 border-t border-slate-200/80 space-y-2">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Official References
                  </div>
                  <ul className="space-y-1.5">
                    {section.links.map((link) => (
                      <li key={link.url}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-start gap-1.5 text-[11.5px] text-slate-600 hover:text-blue-600 transition-colors leading-snug"
                        >
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5 transition-colors" />
                          <span>
                            {link.label}
                            <span className="ml-1 text-[10px] text-slate-400 group-hover:text-blue-500">
                              ({link.source})
                            </span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Primary Legislation & Authorities Bar */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              Primary Authorities:
            </span>
            <a
              href="https://www.legislation.gov.uk/ukpga/1984/51/contents"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 underline underline-offset-2 flex items-center gap-1"
            >
              Inheritance Tax Act 1984 (c. 51)
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>
            <a
              href="https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 underline underline-offset-2 flex items-center gap-1"
            >
              HMRC Inheritance Tax Manual (IHTM)
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>
            <a
              href="https://www.gov.uk/government/publications/inheritance-tax-inheritance-tax-account-iht400"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 underline underline-offset-2 flex items-center gap-1"
            >
              HMRC IHT400 Account Return
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Private: No personal data transmitted or stored remotely without your link share</span>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
          <p>
            <strong className="text-slate-700">Legal Disclaimer:</strong> This calculator is an independent planning and educational tool designed to illustrate standard UK Inheritance Tax principles in accordance with the Inheritance Tax Act 1984, the Finance Act 2006, and subsequent amendments. It does not constitute formal legal, financial, or tax advice. Estate administration, domicile rules, trusts, and complex relief claims can vary significantly depending on individual circumstances. Always seek qualified advice from a registered STEP member (Society of Trust and Estate Practitioners) or a Chartered Tax Adviser (CIOT) before executing wills, lifetime gifts, or estate planning strategies.
          </p>
        </div>
      </div>
    </footer>
  );
}
