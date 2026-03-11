import Image from "next/image";
import Link from "next/link";
import styles from "./MeetSean.module.css";

export default function MeetSean() {
  return (
    <section className={styles.section} aria-label="Meet Sean">
      <div className={styles.background}>
        <Image
          src="/fountain2.jpeg"
          alt=""
          fill
          priority={false}
          quality={90}
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        
        <div className={styles.overlay} />
      </div>
      <div className={styles.content}>
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.left}>
              <p className={styles.kicker}>Meet</p>
              <h2 className={styles.title}>
                <span className={styles.name}>M. Sean Agnew</span>
              </h2>
              <p className={styles.body}>
                Clarity doesn't come from speaking louder. It comes from listening better. I learned that in the military, where noise was constant and mistakes had consequences. Information came fast. Survival depended on one skill: strip away chaos, identify the signal, act decisively. That discipline never left me.
              </p>
              <p className={styles.body}>
                When I stepped into business, I saw the same pattern everywhere. Founders aren't short on intelligence, talent, or effort. They're drowning in noise. Advice. Tactics. Trends. Opinions. Everyone screaming what to do next, each one louder than the last. Over two decades across software, healthcare, entertainment, hospitality, and consulting, I've learned this: Sustainable growth doesn't come from pressure, bravado, or hustle for its own sake. It comes from clear communication and sound decisions.
              </p>
              <p className={styles.body}>
                I've advised thousands of leaders and sales professionals who were excellent at what they did but overwhelmed by what to focus on next. I've watched quiet operators outperform loud talkers. Technical experts out-earn polished pitchmen. Clinicians and founders build trust faster than career sellers—once the noise was removed.
              </p>
              <p className={styles.body}>
                Here's what I know about you: You carry the weight of too many decisions. You feel tension when price or commitment enters the conversation. You love talking about your work—until you have to "sell" it. You second-guess choices and quietly fear regret. You're not broken. You're overloaded.
              </p>
              <p className={styles.body}>
                My role isn't to give you more information. You don't need another framework, another tactic, another guru telling you to "just execute." You need someone to help you find the signal, ignore the noise, and act with confidence. I believe: → Sales should feel like alignment, not persuasion. → Strategy should feel calm, not chaotic. → Growth should feel earned, not exhausting.
              </p>
              <p className={styles.body}>
               I'm not here to impress you with credentials. I'm here to serve you with clarity, frameworks, and honest guidance I wish I had when I was in your position. Because in business, just like in life, clarity doesn't just improve outcomes. It determines them.
              </p>
              <p className={styles.body}>
                If this resonates, let's talk. Let's see if working together would genuinely serve you.
              </p>
              <div className={styles.ctas}>
                <Link href="/are-you-fit" className={styles.primaryCta}>
                  The Right Fit?
                </Link>
                <Link href="/contact" className={styles.secondaryCta}>
                  Book Sean
                </Link>
              </div>
              <p className={styles.platitude}>
                The world doesn't need more noise. It needs more signal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
