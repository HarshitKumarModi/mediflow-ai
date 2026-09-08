import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { AI_BASE_URL } from "../../config/api";
import {
  Bot,
  Send,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Loader2,
} from "lucide-react";

interface AIResponse {
  urgency?: string;
  chiefComplaint?: string;
  summary?: string;
  suggestedQuestions?: string[];
}

function AIAssistant() {
  const [symptoms, setSymptoms] = useState("");
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      setError("Please describe your symptoms first.");
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await fetch(
        `${AI_BASE_URL}/api/ai/pre-visit-summary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symptoms: symptoms.trim(),
          }),
        }
      );

      const data = await result.json().catch(() => null);

      if (!result.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Unable to get a response from the AI assistant."
        );
      }

      setResponse(data);
    } catch (err) {
      console.error("AI Assistant error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the AI assistant."
      );
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyStyle = (urgency?: string) => {
    switch (urgency?.toLowerCase()) {
      case "high":
        return {
          container:
            "bg-red-50 border-red-200 text-red-700",
          icon: <AlertTriangle size={20} />,
        };

      case "medium":
        return {
          container:
            "bg-yellow-50 border-yellow-200 text-yellow-700",
          icon: <AlertTriangle size={20} />,
        };

      case "low":
        return {
          container:
            "bg-green-50 border-green-200 text-green-700",
          icon: <CheckCircle2 size={20} />,
        };

      default:
        return {
          container:
            "bg-slate-50 border-slate-200 text-slate-700",
          icon: <HelpCircle size={20} />,
        };
    }
  };

  const urgencyStyle = getUrgencyStyle(response?.urgency);

  return (
    <DashboardLayout role="patient">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="mb-8">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Bot size={26} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              AI Assistant
            </h1>

            <p className="mt-1 text-slate-500">
              Describe your symptoms and get an AI-powered pre-visit
              assessment.
            </p>
          </div>

        </div>

      </div>


      {/* =========================
          DISCLAIMER
      ========================= */}

      <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">

        <div className="flex gap-3">

          <HelpCircle
            size={21}
            className="text-blue-600 mt-0.5 flex-shrink-0"
          />

          <div>

            <h2 className="font-semibold text-blue-900">
              Important
            </h2>

            <p className="text-sm text-blue-700 mt-1">
              This AI assistant provides general guidance to help
              prepare for a doctor visit. It does not replace a
              professional medical diagnosis or emergency care.
            </p>

          </div>

        </div>

      </div>


      {/* =========================
          SYMPTOM INPUT
      ========================= */}

      <div className="bg-white rounded-2xl border border-slate-200 p-6">

        <h2 className="text-xl font-semibold text-slate-900">
          How are you feeling?
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Tell the AI assistant about your symptoms.
        </p>


        <textarea
          value={symptoms}
          onChange={(e) => {
            setSymptoms(e.target.value);
            setError("");
          }}
          placeholder="Example: I have been having a headache and mild fever since yesterday..."
          rows={7}
          maxLength={2000}
          className="w-full mt-5 border border-slate-300 rounded-xl p-4 outline-none resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />


        <div className="flex items-center justify-between mt-2">

          <p className="text-xs text-slate-400">
            {symptoms.length}/2000 characters
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">

            <p className="text-sm text-red-600">
              {error}
            </p>

          </div>
        )}


        {/* BUTTON */}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-5 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >

          {loading ? (
            <>
              <Loader2
                size={19}
                className="animate-spin"
              />

              Analyzing...
            </>
          ) : (
            <>
              <Send size={19} />

              Analyze Symptoms
            </>
          )}

        </button>

      </div>


      {/* =========================
          AI RESULT
      ========================= */}

      {response && (

        <div className="mt-6 space-y-5">

          {/* URGENCY */}

          <div
            className={`border rounded-2xl p-5 ${urgencyStyle.container}`}
          >

            <div className="flex items-center gap-3">

              {urgencyStyle.icon}

              <div>

                <p className="text-xs uppercase tracking-wide font-medium opacity-70">
                  Urgency Level
                </p>

                <p className="text-xl font-bold mt-0.5">
                  {response.urgency || "Not specified"}
                </p>

              </div>

            </div>

          </div>


          {/* CHIEF COMPLAINT */}

          <div className="bg-white border border-slate-200 rounded-2xl p-6">

            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Chief Complaint
            </h2>

            <div className="bg-slate-50 rounded-xl p-4">

              <p className="text-slate-700">
                {response.chiefComplaint ||
                  "No chief complaint provided."}
              </p>

            </div>

          </div>


          {/* SUMMARY */}

          <div className="bg-white border border-slate-200 rounded-2xl p-6">

            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              AI Summary
            </h2>

            <div className="bg-slate-50 rounded-xl p-4">

              <p className="text-slate-700 whitespace-pre-wrap">
                {response.summary ||
                  "No summary available."}
              </p>

            </div>

          </div>


          {/* SUGGESTED QUESTIONS */}

          <div className="bg-white border border-slate-200 rounded-2xl p-6">

            <div className="flex items-center gap-2 mb-4">

              <HelpCircle
                size={20}
                className="text-teal-600"
              />

              <h2 className="text-lg font-semibold text-slate-900">
                Suggested Questions for Your Doctor
              </h2>

            </div>


            {response.suggestedQuestions &&
            response.suggestedQuestions.length > 0 ? (

              <div className="space-y-3">

                {response.suggestedQuestions.map(
                  (question, index) => (

                    <div
                      key={index}
                      className="flex gap-3 bg-teal-50 border border-teal-100 rounded-xl p-4"
                    >

                      <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>

                      <p className="text-slate-700">
                        {question}
                      </p>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p className="text-slate-500">
                No suggested questions available.
              </p>

            )}

          </div>


          {/* FINAL DISCLAIMER */}

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">

            <p className="text-sm text-slate-500">
              AI-generated information is for informational purposes
              only. Please consult a qualified healthcare professional
              for diagnosis and treatment.
            </p>

          </div>

        </div>

      )}

    </DashboardLayout>
  );
}

export default AIAssistant;