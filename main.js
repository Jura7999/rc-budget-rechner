// Warte, bis das gesamte HTML-Dokument geladen und verarbeitet wurde
document.addEventListener("DOMContentLoaded", function () {
  // --- HIER kommt unser gesamter weiterer Code rein ---
  console.log("DOM ist bereit und Jura auch! Wir können loslegen."); // Test-Nachricht

  // 1. Das Hauptformular finden
  const form = document.getElementById("budget-calculator-form");
  console.log("Formular gefunden:", form); // Prüfen, ob's geklappt hat

  // 2. Alle Schritte (divs mit class="form-step") innerhalb des Formulars finden
  const steps = form.querySelectorAll(".form-step");
  console.log("Schritte gefunden:", steps); // Sollte eine NodeList mit 3 divs sein

  // 3. Den/die "Weiter"-Button(s) finden (wir nehmen erstmal alle, auch wenn es nur einer ist)
  const nextButtons = form.querySelectorAll(".next-button");
  console.log("Weiter Buttons gefunden:", nextButtons);

  // 4. Den "Ergebnisse anzeigen"-Button finden
  const resultsButton = form.querySelector(".results-button"); // querySelector, da wir nur einen erwarten
  console.log("Ergebnis Button gefunden:", resultsButton);

  // 5. Den Bereich finden, der die Ergebnisse anzeigt (Schritt 3)
  const resultsDiv = form.querySelector("#step-3"); // ID ist eindeutig, geht auch mit getElementById
  console.log("Ergebnis Div gefunden:", resultsDiv);

  // 6. Eine Variable, um den aktuellen Schritt-Index zu speichern (0 für den ersten Schritt)
  let currentStepIndex = 0;
  console.log("Aktueller Schritt (Start):", currentStepIndex);

  let budgetChartInstance = null;

  // --- NEUE HILFSFUNKTIONEN START ---

  // Zeigt eine Fehlermeldung für einen bestimmten Schritt an
  function displayErrorMessage(stepIndex, message) {
    const errorElement = document.getElementById(`step-${stepIndex + 1}-error`); // Finde das <p> für den Schritt (Index + 1 = Schrittnummer)
    if (errorElement) {
      errorElement.textContent = message; // Setze den Text der Fehlermeldung
    }
  }

  // Löscht die Fehlermeldung für einen bestimmten Schritt
  function clearErrorMessage(stepIndex) {
    const errorElement = document.getElementById(`step-${stepIndex + 1}-error`);
    if (errorElement) {
      errorElement.textContent = ""; // Setze den Text auf leer
    }
  }

  // Fügt einem Input-Feld die Fehler-Styling-Klassen hinzu (und entfernt Standard)
  function addInputErrorStyle(inputElement) {
    // Tailwind-Klassen für den Fehlerzustand (Beispiel - anpassen falls nötig)
    inputElement.classList.add("border-red-500", "focus:ring-red-500");
    // Standard/Erfolgs-Klassen entfernen, um Konflikte zu vermeiden
    inputElement.classList.remove(
      "border-gray-300",
      "focus:ring-accent-gold/50"
    );

    // Wenn es ein Select ist, evtl. auch den Wrapper anpassen? (Fürs Erste nicht nötig)
    // const wrapper = inputElement.closest('div'); // Finde den nächsten div-Wrapper
    // if (wrapper) wrapper.classList.add('border-red-500'); // Beispiel
  }

  // Entfernt die Fehler-Styling-Klassen von einem Input-Feld (und stellt Standard wieder her)
  function removeInputErrorStyle(inputElement) {
    inputElement.classList.remove("border-red-500", "focus:ring-red-500");
    inputElement.classList.add("border-gray-300", "focus:ring-accent-gold/50");

    // Evtl. Wrapper-Styling auch zurücksetzen
    // const wrapper = inputElement.closest('div');
    // if (wrapper) wrapper.classList.remove('border-red-500');
  }

  // Entfernt Fehler-Styling von allen Inputs innerhalb eines Schritt-Elements
  function clearAllErrorStyles(stepElement) {
    const inputsInStep = stepElement.querySelectorAll("input, select"); // Alle Inputs und Selects im Schritt finden
    inputsInStep.forEach(removeInputErrorStyle); // Fehlerstyle für jeden entfernen
  }

  // --- NEUE HILFSFUNKTIONEN ENDE ---

  // Funktion, um einen bestimmten Schritt anzuzeigen und andere zu verstecken
  function showStep(stepIndexToShow) {
    console.log("Zeige Schritt mit Index:", stepIndexToShow); // Zum Nachverfolgen

    // Gehe alle Schritt-Elemente durch, die wir oben in 'steps' gespeichert haben
    steps.forEach(function (stepElement, index) {
      // stepElement: Das aktuelle div-Element des Schritts in dieser Runde der Schleife
      // index: Der Index dieses Schritts in der 'steps'-Liste (0, 1 oder 2)

      // Vergleiche den Index des aktuellen Schritts mit dem Index, der angezeigt werden soll
      if (index === stepIndexToShow) {
        // Dieser Schritt soll angezeigt werden: Entferne die 'hidden'-Klasse
        stepElement.classList.remove("hidden");
        console.log(" -> Mache Schritt", index, "sichtbar");
      } else {
        // Alle anderen Schritte sollen versteckt werden: Füge die 'hidden'-Klasse hinzu
        stepElement.classList.add("hidden");
        console.log(" -> Verstecke Schritt", index);
      }
    });
  }

  if (nextButtons.length > 0) {
    nextButtons[0].addEventListener("click", function () {
      console.log("Weiter-Button geklickt! Starte Validierung Schritt 1...");
      const stepIndex = 0; // Wir sind in Schritt 1 (Index 0)
      let isStepValid = true; // Wichtig: Gehen erstmal von Gültigkeit aus

      // --- Elemente für Schritt 1 holen (Inputs und Hints) ---
      const currentStepElement = steps[stepIndex];
      const budgetInput = document.getElementById("total-budget");
      const revenueInput = document.getElementById("current-revenue");
      const focusSelect = document.getElementById("business-focus");
      const goalSelect = document.getElementById("main-goal");
      const budgetHintEl = document.getElementById("total-budget-hint");
      const revenueHintEl = document.getElementById("current-revenue-hint");
      // (Wir könnten auch noch Hints für Selects hinzufügen, wenn nötig)

      // --- Alte Fehler & Hints zurücksetzen ---
      clearErrorMessage(stepIndex); // Allgemeine Fehlermeldung über Button löschen
      clearAllErrorStyles(currentStepElement); // Alle roten Rahmen entfernen
      // Standard-Hint-Texte wiederherstellen (WICHTIG!)
      if (budgetHintEl) budgetHintEl.textContent = "Jährliche Angabe";
      if (revenueHintEl) revenueHintEl.textContent = "Jährliche Angabe";

      // --- Validierungen durchführen ---

      // 1. Pflichtfeld: Marketing Budget
      if (!budgetInput.value) {
        isStepValid = false;
        addInputErrorStyle(budgetInput);
        if (budgetHintEl)
          budgetHintEl.textContent = "Dies ist ein Pflichtfeld.";
        console.error("Fehlendes Pflichtfeld:", budgetInput.id);
      } else {
        // 2. Mindestwert: Marketing Budget (nur prüfen, wenn nicht leer)
        const budgetValue = parseFloat(budgetInput.value) || 0;
        if (budgetValue < 3000) {
          isStepValid = false;
          addInputErrorStyle(budgetInput);
          if (budgetHintEl)
            budgetHintEl.textContent = "Mindestens 3.000 € erforderlich.";
          console.error("Marketing Budget zu niedrig:", budgetValue);
        }
        // Wenn gültig (else), wird der Hint oben schon auf Standard gesetzt
      }

      // 3. Pflichtfeld: Jahresumsatz
      if (!revenueInput.value) {
        isStepValid = false;
        addInputErrorStyle(revenueInput);
        if (revenueHintEl)
          revenueHintEl.textContent = "Dies ist ein Pflichtfeld.";
        console.error("Fehlendes Pflichtfeld:", revenueInput.id);
      } else {
        // 4. Mindestwert: Jahresumsatz (nur prüfen, wenn nicht leer)
        const revenueValue = parseFloat(revenueInput.value) || 0;
        if (revenueValue < 500000) {
          isStepValid = false;
          addInputErrorStyle(revenueInput);
          if (revenueHintEl)
            revenueHintEl.textContent = "Mindestens 500.000 € erforderlich.";
          console.error("Jahresumsatz zu niedrig:", revenueValue);
        }
        // Wenn gültig (else), wird der Hint oben schon auf Standard gesetzt
      }

      // 5. Pflichtfeld: Unternehmensfokus (Select)
      if (!focusSelect.value) {
        isStepValid = false;
        addInputErrorStyle(focusSelect); // Roter Rahmen für Select
        console.error("Fehlendes Pflichtfeld:", focusSelect.id);
        // Hier könnte man auch einen Hint hinzufügen, wenn es ein <p> dafür gäbe
      }

      // 6. Pflichtfeld: Hauptziel (Select)
      if (!goalSelect.value) {
        isStepValid = false;
        addInputErrorStyle(goalSelect); // Roter Rahmen für Select
        console.error("Fehlendes Pflichtfeld:", goalSelect.id);
        // Hier könnte man auch einen Hint hinzufügen
      }

      // --- Ergebnis der Validierung behandeln ---
      if (!isStepValid) {
        // Wenn *irgendeine* Prüfung fehlgeschlagen ist: Allgemeine Fehlermeldung anzeigen
        displayErrorMessage(
          stepIndex,
          "Bitte prüfen Sie die rot markierten Felder."
        );
        console.log("Validierung Schritt 1 fehlgeschlagen.");
        return; // Funktion hier abbrechen, nicht zum nächsten Schritt gehen
      }

      // --- Wenn alles gültig ist: Zum nächsten Schritt gehen ---
      console.log("Validierung Schritt 1 erfolgreich.");
      currentStepIndex++;
      if (currentStepIndex < steps.length) {
        showStep(currentStepIndex); // Ruft showStep(1) auf
      } else {
        console.log("Ende der Schritte erreicht (über Next Button?)");
        currentStepIndex = steps.length - 1;
      }
    }); // Ende des Event Listeners für 'click'
  } // Ende von if (nextButtons.length > 0)

  // Event Listener für den "Ergebnisse anzeigen"-Button
  if (resultsButton) {
    resultsButton.addEventListener("click", function () {
      console.log("Ergebnis-Button geklickt!");
      const stepIndex = 1; // Wir sind in Schritt 2 (Index 1)

      // 1. Alte Fehler löschen
      clearErrorMessage(stepIndex);
      clearAllErrorStyles(steps[stepIndex]);

      // 2. Validierung durchführen
      let isStepValid = true;
      const currentStepElement = steps[stepIndex];
      const requiredInputs =
        currentStepElement.querySelectorAll("input[required]"); // Nur Inputs hier relevant

      requiredInputs.forEach(function (input) {
        if (input.type === "checkbox") {
          if (!input.checked) {
            isStepValid = false;
            addInputErrorStyle(input.closest("div")); // Evtl. den ganzen Div markieren? Oder nur Checkbox stylen? Bleiben wir erstmal bei der Checkbox selbst schwierig zu stylen, evtl. das Label. Vorerst keine Markierung für Checkbox.
            console.error("Checkbox nicht akzeptiert:", input.id);
          }
          // else { removeInputErrorStyle(input); }
        } else {
          if (!input.value) {
            isStepValid = false;
            addInputErrorStyle(input); // Rote Markierung hinzufügen
            console.error("Fehlendes Pflichtfeld:", input.id);
          }
          // else { removeInputErrorStyle(input); }
        }
      });

      // 3. Ergebnis der Validierung behandeln
      if (!isStepValid) {
        // Wenn ungültig: Fehlermeldung anzeigen und abbrechen
        // Leichte Anpassung der Meldung wegen Checkbox
        displayErrorMessage(
          stepIndex,
          "Bitte prüfen Sie die Angaben und akzeptieren Sie den Datenschutz."
        );
        return;
      }

      // 4. Wenn gültig: Ergebnisse anzeigen und Berechnung starten
      showStep(2);
      calculateAndDisplayResults();
    }); // Ende des Event Listeners für 'click'
  } // Ende von if (resultsButton)

  function calculateAndDisplayResults() {
    console.log("Starte calculateAndDisplayResults...");

    // 1. Werte aus Schritt 1 auslesen
    // .value gibt Text zurück, mit parseFloat in Zahlen umwandeln
    // || 0 sorgt dafür, dass wir 0 haben, falls das Feld leer ist oder keine Zahl (sollte durch Validierung nicht passieren)
    const totalBudget =
      parseFloat(document.getElementById("total-budget").value) || 0;
    const currentRevenue =
      parseFloat(document.getElementById("current-revenue").value) || 0; // In V1 nur für Kontext
    const businessFocus = document.getElementById("business-focus").value; // Gibt z.B. "neukunden" zurück
    const mainGoal = document.getElementById("main-goal").value; // Gibt z.B. "branding" zurück

    console.log("Eingaben:", {
      totalBudget,
      currentRevenue,
      businessFocus,
      mainGoal,
    });

    // 2. Basis-Prozentsätze definieren (V1)
    let digitalPerc = 50;
    let offlinePerc = 40;
    let printPerc = 10;

    console.log("Basis-Prozentsätze:", { digitalPerc, offlinePerc, printPerc });

    // 3. Anpassungen basierend auf Auswahl (V1)
    // Anpassung für Unternehmensfokus
    if (businessFocus === "neukunden") {
      digitalPerc += 10; // +10
      offlinePerc -= 5; // -5
      printPerc -= 5; // -5
      console.log("Anpassung für Fokus 'Neukunden' angewendet.");
    }
    // Füge hier bei Bedarf else if für 'bestandskunden', 'export' etc. hinzu

    // Anpassung für Hauptziel (wird additiv zur Fokus-Anpassung gerechnet)
    if (mainGoal === "branding") {
      digitalPerc -= 5; // -5
      offlinePerc += 10; // +10
      printPerc -= 5; // -5
      console.log("Anpassung für Ziel 'Markenbekanntheit' angewendet.");
    }
    // Füge hier bei Bedarf else if für 'leads', 'sales' etc. hinzu

    console.log("Prozentsätze nach Anpassung:", {
      digitalPerc,
      offlinePerc,
      printPerc,
    });

    // 4. Sicherstellen, dass Prozentsätze nicht negativ sind (optional, aber sicherer)
    digitalPerc = Math.max(0, digitalPerc);
    offlinePerc = Math.max(0, offlinePerc);
    printPerc = Math.max(0, printPerc);

    // 5. Normalisieren: Sicherstellen, dass die Summe 100% ergibt
    let sumPercentages = digitalPerc + offlinePerc + printPerc;
    console.log("Summe vor Normalisierung:", sumPercentages);

    if (sumPercentages === 0) {
      // Fallback, falls alle negativ waren und auf 0 gesetzt wurden
      digitalPerc = 34;
      offlinePerc = 33;
      printPerc = 33;
      sumPercentages = 100;
      console.warn("Summe war 0, setze auf Fallback-Werte.");
    } else if (sumPercentages !== 100) {
      const factor = 100 / sumPercentages;
      digitalPerc *= factor;
      offlinePerc *= factor;
      printPerc *= factor;
      console.log("Prozentsätze normalisiert mit Faktor:", factor);
    }

    // 6. Ergebnisse auf eine Nachkommastelle runden
    digitalPerc = digitalPerc.toFixed(1);
    offlinePerc = offlinePerc.toFixed(1);
    printPerc = printPerc.toFixed(1);

    console.log("Finale Prozentsätze:", {
      digitalPerc,
      offlinePerc,
      printPerc,
    });

    // 7. Ergebnisse im HTML anzeigen (nur Prozente in V1)
    const digitalResultSpan = document.getElementById("result-digital");
    const offlineResultSpan = document.getElementById("result-offline");
    const printResultSpan = document.getElementById("result-print");

    if (digitalResultSpan) digitalResultSpan.textContent = digitalPerc + "%";
    if (offlineResultSpan) offlineResultSpan.textContent = offlinePerc + "%";
    if (printResultSpan) printResultSpan.textContent = printPerc + "%";

    console.log("Ergebnisse im HTML aktualisiert.");

    // 8. Euro-Beträge berechnen (für spätere Anzeige oder Konsole)
    const euroDigital = ((totalBudget * parseFloat(digitalPerc)) / 100).toFixed(
      2
    );
    const euroOffline = ((totalBudget * parseFloat(offlinePerc)) / 100).toFixed(
      2
    );
    const euroPrint = ((totalBudget * parseFloat(printPerc)) / 100).toFixed(2);

    console.log("Euro-Beträge (berechnet):", {
      euroDigital,
      euroOffline,
      euroPrint,
    });
    // Hier könnten wir die Euro-Beträge auch ins HTML schreiben, wenn wir Platzhalter dafür hätten.

    // Wichtig: .toFixed() gibt einen String zurück, Chart.js braucht aber Zahlen.
    // Deshalb wandeln wir sie mit parseFloat() wieder in Zahlen um.
    updateResultsChart(
      parseFloat(digitalPerc),
      parseFloat(offlinePerc),
      parseFloat(printPerc)
    );
  } // Ende der Funktion calculateAndDisplayResults

  // Funktion zum Erstellen/Aktualisieren des Ergebnis-Diagramms
  function updateResultsChart(digital, offline, print) {
    console.log("Starte updateResultsChart mit Werten:", {
      digital,
      offline,
      print,
    });

    // 1. Canvas-Element holen
    const canvasElement = document.getElementById("resultsChart");
    if (!canvasElement) {
      console.error("Canvas Element 'resultsChart' nicht gefunden!");
      return; // Funktion abbrechen, wenn Canvas fehlt
    }

    // 2. 2D-Kontext holen (zum Zeichnen benötigt)
    const ctx = canvasElement.getContext("2d");
    if (!ctx) {
      console.error("Konnte 2D-Kontext vom Canvas nicht holen!");
      return; // Funktion abbrechen
    }

    // 3. Altes Diagramm zerstören, falls vorhanden
    //    Wichtig, damit bei Neuberechnung kein Chaos entsteht
    if (budgetChartInstance) {
      console.log("Zerstöre altes Diagramm...");
      budgetChartInstance.destroy();
    }

    // 4. Neues Diagramm erstellen und in unserer Variable speichern
    console.log("Erstelle neues Diagramm...");
    budgetChartInstance = new Chart(ctx, {
      type: "doughnut", // 'pie' für einen vollen Kuchen, 'doughnut' für einen Ring
      data: {
        labels: ["Digital", "Offline", "Print"],
        datasets: [
          {
            label: "Budgetverteilung %", // Optional: Titel des Datensatzes
            data: [digital, offline, print], // Die berechneten Prozentwerte
            backgroundColor: [
              // Farben für die Segmente
              "#3b82f6", // Tailwind blue-500 (Beispiel)
              "#10b981", // Tailwind emerald-500 (Beispiel)
              "#f97316", // Tailwind orange-500 (Beispiel)
              // Du kannst hier die Farben an dein Design anpassen (Hex, RGB, etc.)
            ],
            borderColor: "#ffffff", // Farbe des Randes zwischen Segmenten
            borderWidth: 2, // Breite des Randes
          },
        ],
      },
      options: {
        responsive: true, // Passt sich an Containergröße an
        maintainAspectRatio: false, // Wichtig bei fester Containerhöhe, erlaubt flexiblere Größenanpassung
        plugins: {
          legend: {
            display: true, // Legende anzeigen (standardmäßig oben)
            position: "bottom", // Position der Legende (z.B. 'top', 'bottom', 'left', 'right')
          },
          tooltip: {
            // Optionen für die Tooltips, die beim Hovern erscheinen (Standard ist meist okay)
          },
        },
        // Hier könnten weitere Optionen hinzukommen (Titel etc.)
      },
    }); // Ende new Chart(...)

    console.log("Diagramm erstellt/aktualisiert.");
  } // Ende der Funktion updateResultsChart
});
