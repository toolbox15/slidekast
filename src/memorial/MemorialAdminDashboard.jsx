import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig"; // FIXED: Matched your project's exact case-sensitive root filename
import { doc, updateDoc } from "firebase/firestore";

export const MemorialAdminDashboard = ({ 
  eventId = "smith-wedding-2026",
  initialEarlyYears = [],
  initialFamily = [],
  initialLegacy = []
}) => {
  // FIXED: Set state dynamically using the incoming props passed from main.jsx
  const [earlyYears, setEarlyYears] = useState(initialEarlyYears);
  const [family, setFamily] = useState(initialFamily);
  const [legacy, setLegacy] = useState(initialLegacy);
  const [activeTab, setActiveTab] = useState("earlyYears");

  // Keep the form inputs perfectly in sync if the background Firestore stream updates
  useEffect(() => { setEarlyYears(initialEarlyYears); }, [initialEarlyYears]);
  useEffect(() => { setFamily(initialFamily); }, [initialFamily]);
  useEffect(() => { setLegacy(initialLegacy); }, [initialLegacy]);

  // Unified save function to push the structured maps back to Firestore
  const saveToFirestore = async (updatedArray, fieldName) => {
    try {
      const docRef = doc(db, "events", eventId);
      await updateDoc(docRef, {
        [fieldName]: updatedArray
      });
      alert("Layout changes saved successfully live to screen!");
    } catch (error) {
      console.error("Error updating database:", error);
      alert("Failed to save changes.");
    }
  };

  const updateSlideProperty = (array, setArray, index, property, value, fieldName) => {
    const copy = [...array];
    
    // Ensure we convert any lingering raw strings into our advanced control map structure safely
    if (typeof copy[index] === "string") {
      copy[index] = {
        primary_url: copy[index],
        layoutType: "full-screen",
        caption: "",
        textStyle: "classic-serif",
        sibling_urls: []
      };
    }

    // Handle updating nested sibling array URLs vs normal string fields
    if (property === "sibling_url_0") {
      copy[index]["sibling_urls"] = value ? [value] : [];
    } else {
      copy[index][property] = value;
    }

    setArray(copy);
  };

  const currentList = activeTab === "earlyYears" ? earlyYears : activeTab === "family" ? family : legacy;
  const currentSetter = activeTab === "earlyYears" ? setEarlyYears : activeTab === "family" ? setFamily : setLegacy;
  const currentFirestoreField = activeTab === "earlyYears" ? "earlyYearsPhotos" : activeTab === "family" ? "familyPhotos" : "legacyPhotos";

  return (
    <div style={{ background: "#0d1113", color: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", padding: "40px" }}>
      
      {/* Header Panel */}
      <div style={{ borderBottom: "1px solid rgba(217,191,141,0.3)", paddingBottom: "20px", marginBottom: "30px" }}>
        <h1 style={{ color: "#d9bf8d", margin: "0 0 10px 0", fontSize: "28px", letterSpacing: "1px" }}>
          ScreenXcel Director Studio
        </h1>
        <p style={{ color: "#94a3b8", margin: 0, fontSize: "14px" }}>
          Granular Visual Control Panel for Event ID: <strong style={{ color: "#fff" }}>{eventId}</strong>
        </p>
      </div>

      {/* Timeline Section Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "25px" }}>
        {[
          { id: "earlyYears", label: "The Early Years Section" },
          { id: "family", label: "Life & Family Section" },
          { id: "legacy", label: "Lasting Legacy Section" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "12px 20px",
              background: activeTab === tab.id ? "#d9bf8d" : "#1e293b",
              color: activeTab === tab.id ? "#0d1113" : "#f8fafc",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "all 0.2s"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Slide Editor Loop Container */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {currentList.map((item, index) => {
          const slideData = typeof item === "string" ? { primary_url: item, layoutType: "full-screen", caption: "", textStyle: "classic-serif", sibling_urls: [] } : item;
          const siblingUrl = slideData.sibling_urls?.[0] || "";

          return (
            <div 
              key={index} 
              style={{
                background: "#161f23",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "20px",
                display: "flex",
                gap: "24px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
              }}
            >
              {/* Thumbnail Display Box */}
              <div style={{ width: "140px", height: "140px", background: "#0d1113", borderRadius: "6px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(217,191,141,0.2)" }}>
                {slideData.primary_url ? (
                  <img src={slideData.primary_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ color: "#475569", fontSize: "12px" }}>No Media URL</span>
                )}
              </div>

              {/* Graphical Control Inputs */}
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                
                {/* 1. Media Source Fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", color: "#d9bf8d", textTransform: "uppercase", letterSpacing: "1px" }}>Primary Photo Image Link</label>
                  <input
                    type="text"
                    value={slideData.primary_url || ""}
                    onChange={(e) => updateSlideProperty(currentList, currentSetter, index, "primary_url", e.target.value, currentFirestoreField)}
                    style={{ background: "#0d1113", border: "1px solid #334155", padding: "8px 12px", borderRadius: "4px", color: "#fff", fontSize: "14px" }}
                  />
                </div>

                {/* 2. Motion Profile Selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", color: "#d9bf8d", textTransform: "uppercase", letterSpacing: "1px" }}>Motion & Composition Framework</label>
                  <select
                    value={slideData.layoutType || "full-screen"}
                    onChange={(e) => updateSlideProperty(currentList, currentSetter, index, "layoutType", e.target.value, currentFirestoreField)}
                    style={{ background: "#0d1113", border: "1px solid #334155", padding: "8px 12px", borderRadius: "4px", color: "#fff", fontSize: "14px", height: "38px" }}
                  >
                    <option value="full-screen">Cinematic Single Landscape Drift (Full Frame)</option>
                    <option value="split-portrait">Editorial Split-Portrait Pairing (Side-by-Side Counters)</option>
                  </select>
                </div>

                {/* 3. Caption Copy Field */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", color: "#d9bf8d", textTransform: "uppercase", letterSpacing: "1px" }}>Overlay Caption Text</label>
                  <input
                    type="text"
                    placeholder="Leave completely blank to clear space for zero image text overlap..."
                    value={slideData.caption || ""}
                    onChange={(e) => updateSlideProperty(currentList, currentSetter, index, "caption", e.target.value, currentFirestoreField)}
                    style={{ background: "#0d1113", border: "1px solid #334155", padding: "8px 12px", borderRadius: "4px", color: "#fff", fontSize: "14px" }}
                  />
                </div>

                {/* 4. Font Typography Rule Matcher */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", color: "#d9bf8d", textTransform: "uppercase", letterSpacing: "1px" }}>Typography Design Engine Style</label>
                  <select
                    value={slideData.textStyle || "classic-serif"}
                    onChange={(e) => updateSlideProperty(currentList, currentSetter, index, "textStyle", e.target.value, currentFirestoreField)}
                    style={{ background: "#0d1113", border: "1px solid #334155", padding: "8px 12px", borderRadius: "4px", color: "#fff", fontSize: "14px", height: "38px" }}
                  >
                    <option value="classic-serif">Traditional Warm Luxury (Georgia Serif Italic)</option>
                    <option value="modern-caps">Minimalist Clean Corporate (Arial Wide-Spaced Uppercase)</option>
                  </select>
                </div>

                {/* Conditional Secondary Sibling Image Input */}
                {slideData.layoutType === "split-portrait" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "span 2" }}>
                    <label style={{ fontSize: "12px", color: "#e2e8f0", textTransform: "uppercase", letterSpacing: "1px" }}>Secondary Right-Side Portrait Image Link</label>
                    <input
                      type="text"
                      placeholder="Paste the storage URL link for the right side portrait image panel..."
                      value={siblingUrl}
                      onChange={(e) => updateSlideProperty(currentList, currentSetter, index, "sibling_url_0", e.target.value, currentFirestoreField)}
                      style={{ background: "#0d1113", border: "1px solid #d9bf8d", padding: "8px 12px", borderRadius: "4px", color: "#fff", fontSize: "14px" }}
                    />
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* Global Bottom Control Bar */}
      <div style={{ marginTop: "40px", background: "#161f23", padding: "20px", borderRadius: "8px", display: "flex", justifyContent: "flex-end", border: "1px solid rgba(217,191,141,0.3)" }}>
        <button
          onClick={() => saveToFirestore(currentList, currentFirestoreField)}
          style={{
            background: "#d9bf8d",
            color: "#0d1113",
            border: "none",
            padding: "14px 32px",
            fontSize: "16px",
            fontWeight: "700",
            borderRadius: "6px",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(217,191,141,0.3)"
          }}
        >
          Save Layout & Push Controls Live
        </button>
      </div>

    </div>
  );
};