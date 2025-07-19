import * as React from "react";
import Link from "next/link";

const tools = [
  {
    label: "Smart Conclusion Engine",
    description:
      "Get instant legal insights. Our AI instantly analyzes legal texts or queries, conducts in-depth research, and delivers clear, evidence-backed conclusions—saving you hours of manual work.",
    gradient:
      "bg-gradient-to-br from-green-400/60 to-green-700/60 hover:from-green-400 hover:to-green-700",
  },
  {
    label: "Case to Action Plan",
    description:
      "Get a personalized, step-by-step legal action plan tailored to your case. Whether you're resolving a dispute, filing a claim, or navigating regulations, you'll know exactly what to do next.",
    gradient:
      "bg-gradient-to-br from-orange-400/60 to-orange-700/60 hover:from-orange-400 hover:to-orange-700",
  },
  {
    label: "Risk & Compliance assessment",
    description: "",
    comingSoon: true,
    gradient:
      "bg-gradient-to-br from-slate-800 to-slate-900 opacity-70 hover:opacity-100",
  },
];

export default function ToolsPage() {
  return (
    <div className="p-12 flex flex-col gap-10 max-w-6xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-semibold">Advanced Tools</h1>
      <div className="grid sm:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.label}
            href={tool.comingSoon ? "#" : "/workspace"}
            className={`relative aspect-square rounded-lg p-4 text-left flex flex-col justify-end overflow-hidden ${
              tool.gradient
            } ${
              tool.comingSoon &&
              "pointer-events-none opacity-60 cursor-not-allowed"
            }`}
          >
            {tool.comingSoon && (
              <span className="absolute top-2 right-2 text-xs bg-neutral-900 text-neutral-100 py-0.5 px-2 rounded-full">
                Coming Soon
              </span>
            )}
            <span className="text-xl font-semibold leading-tight max-w-[14ch]">
              {tool.label}
            </span>
            {tool.description && (
              <p className="mt-2 text-sm leading-snug text-neutral-200">
                {tool.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
