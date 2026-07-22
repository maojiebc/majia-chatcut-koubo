import type { ReactNode } from "react";
import "../tokens/themes.css";
import "../components/portrait-talk-card.css";
import { portraitThemeById, type PortraitLayoutId, type PortraitThemeId } from "../tokens/themes";

type Props = {
  theme?: PortraitThemeId;
  layout?: PortraitLayoutId;
  eyebrow?: string;
  title: ReactNode;
  lead?: string;
  emphasis: string;
  cta?: string;
  footer?: string;
  speaker?: ReactNode;
  speakerMode?: "frame" | "cutout";
};

export function PortraitTalkCard({
  theme = "deep-space-blue",
  layout,
  eyebrow = "连锁餐饮 AI 实战",
  title,
  lead = "真正决定结果的是",
  emphasis,
  cta,
  footer = "先补数据，再谈模型",
  speaker,
  speakerMode = "frame",
}: Props) {
  const themeData = portraitThemeById[theme];
  const resolvedLayout = layout ?? themeData.layout;
  return (
    <article className="talk-card" data-theme={theme} data-layout={resolvedLayout} data-mode={themeData.mode}>
      <div className="talk-card__background" aria-hidden="true" />
      <div className="talk-card__ambient" aria-hidden="true" />
      <div className="talk-card__eyebrow">{eyebrow}</div>
      <h1 className="talk-card__title">{title}</h1>
      <p className="talk-card__lead">{lead}</p>
      <p className="talk-card__emphasis">{emphasis}</p>
      {cta ? <div className="talk-card__cta">{cta}</div> : null}
      <div className={`talk-card__speaker${speakerMode === "cutout" ? " is-cutout" : ""}`}>{speaker ?? <div className="talk-card__speaker-figure" />}</div>
      <div className="talk-card__footer">{footer}</div>
    </article>
  );
}
