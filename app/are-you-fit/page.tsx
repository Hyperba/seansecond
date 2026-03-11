"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./page.module.css";

type Question = {
  id: string;
  question_group: string;
  question_order: number;
  question_text: string;
};

type FormState = "lead" | "survey" | "details" | "loading" | "success" | "error";

export default function AreYouFitPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, boolean>>({});
  const [formState, setFormState] = useState<FormState>("lead");
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLeadSubmitting, setIsLeadSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/questions")
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setIsLoading(false);
      })
      .catch(() => {
        setFormError("Unable to load questions.");
        setIsLoading(false);
      });
  }, []);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(responses).length;
  const allAnswered = answeredCount === totalQuestions;

  const handleAnswer = (answer: boolean) => {
    if (!currentQuestion) return;

    setResponses((prev) => ({ ...prev, [currentQuestion.id]: answer }));

    if (currentIndex < totalQuestions - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleContinueToDetails = () => {
    setFormState("details");
  };

  const handleLeadSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLeadSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, source: "survey" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Unable to save email.");
      }

      setFormState("survey");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to save email.",
      );
    } finally {
      setIsLeadSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch("/api/survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, responses }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Unable to submit survey.");
      }

      setFormState("success");
    } catch (error) {
      setIsSubmitting(false);
      setFormError(
        error instanceof Error ? error.message : "Unable to submit survey.",
      );
    }
  };

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>Loading...</div>
      </main>
    );
  }

  if (formState === "success") {
    return (
      <main className={styles.page}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.successTitle}>Thank you!</h1>
          <p className={styles.successText}>
            Your responses have been submitted. Sean will review them and reach out
            if there's a clear fit.
          </p>
        </div>
      </main>
    );
  }

  if (formState === "lead") {
    return (
      <main className={styles.page}>
        <div className={styles.detailsCard}>
          <p className={styles.kicker}>Start Here</p>
          <h1 className={styles.title}>Let&apos;s keep you in the loop</h1>
          <p className={styles.lede}>
            Enter your email to begin the assessment. We&apos;ll send your results once you
            finish.
          </p>

          <form className={styles.form} onSubmit={handleLeadSubmit}>
            <div className={styles.row}>
              <label className={styles.label} htmlFor="lead-email">
                Email
              </label>
              <input
                id="lead-email"
                name="email"
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {formError && <p className={styles.error}>{formError}</p>}

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isLeadSubmitting}
              >
                {isLeadSubmitting ? "Saving..." : "Begin Assessment"}
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  if (formState === "details") {
    return (
      <main className={styles.page}>
        <div className={styles.detailsCard}>
          <p className={styles.kicker}>Almost done</p>
          <h1 className={styles.title}>Your details</h1>
          <p className={styles.lede}>
            Confirm your name and we&apos;ll submit your responses.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <label className={styles.label} htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={email}
                readOnly
              />
            </div>

            {formError && (
              <p className={styles.error}>{formError}</p>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => setFormState("survey")}
                disabled={isSubmitting}
              >
                Back to Questions
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.kicker}>The Right Fit?</p>
          <h1 className={styles.title}>Clarity Assessment</h1>
          <p className={styles.lede}>
            The world doesn't need more noise. It needs more signal.
          </p>
        </div>

        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
          <p className={styles.progressText}>
            {answeredCount} of {totalQuestions} answered
          </p>
        </div>

        {currentQuestion && (
          <div className={styles.questionCard} key={currentQuestion.id}>
            <p className={styles.groupLabel}>{currentQuestion.question_group}</p>
            <h2 className={styles.questionText}>{currentQuestion.question_text}</h2>

            <div className={styles.answerButtons}>
              <button
                type="button"
                className={`${styles.answerBtn} ${
                  responses[currentQuestion.id] === true ? styles.selected : ""
                }`}
                onClick={() => handleAnswer(true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={`${styles.answerBtn} ${
                  responses[currentQuestion.id] === false ? styles.selected : ""
                }`}
                onClick={() => handleAnswer(false)}
              >
                No
              </button>
            </div>

            <div className={styles.navigation}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ArrowLeft size={16} /> Previous
              </button>
              <span className={styles.navIndicator}>
                {currentIndex + 1} / {totalQuestions}
              </span>
              <button
                type="button"
                className={styles.navBtn}
                onClick={handleNext}
                disabled={currentIndex === totalQuestions - 1}
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {allAnswered && (
          <div className={styles.completeCard}>
            <p className={styles.completeText}>
              All questions answered. Ready to submit?
            </p>
            <button
              type="button"
              className={styles.continueBtn}
              onClick={handleContinueToDetails}
            >
              Continue to Submit
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
