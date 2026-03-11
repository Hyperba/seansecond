"use client";

import { useState } from "react";
import styles from "./page.module.css";

type FormState = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
    website: "",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormState("loading");
    setFormError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Unable to send message.");
      }

      setFormState("success");
      setFormData({ name: "", email: "", company: "", message: "", website: "" });
    } catch (error) {
      setFormState("error");
      setFormError(
        error instanceof Error ? error.message : "Unable to send message.",
      );
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <p className={styles.kicker}>Contact</p>
            <h1 className={styles.title}>Let’s connect.</h1>
            <p className={styles.lede}>
              Share your goals, timeline, and context. Sean personally reviews each
              request and will respond if there’s a clear fit.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.infoCard}>
              <h2 className={styles.infoTitle}>What to include</h2>
              <ul className={styles.infoList}>
                <li>Event or engagement type</li>
                <li>Audience size and location</li>
                <li>Timing and budget range</li>
                <li>What clarity or outcome you want</li>
              </ul>
              <p className={styles.note}>
                Prefer email? Use the form and you’ll receive a response directly.
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.row}>
                <label className={styles.label} htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  className={styles.input}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.row}>
                <label className={styles.label} htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={styles.input}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.row}>
                <label className={styles.label} htmlFor="company">
                  Company (optional)
                </label>
                <input
                  id="company"
                  name="company"
                  className={styles.input}
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.row}>
                <label className={styles.label} htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  className={styles.textarea}
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  required
                />
              </div>

              <div className={styles.honeypot}>
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {formState === "success" && (
                <p className={styles.success}>Thanks — your message is on its way.</p>
              )}
              {formState === "error" && (
                <p className={styles.error}>{formError}</p>
              )}

              <button
                type="submit"
                className={styles.submit}
                disabled={formState === "loading"}
              >
                {formState === "loading" ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
