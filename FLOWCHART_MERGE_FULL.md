# Placify Merge Flowchart - Full Version

Use this diagram as the canonical visual plan for implementation and team alignment.

```mermaid
flowchart TD
    A([Start Application]) --> B{Choose Role}

    %% Admin branch
    B -->|Admin Placement Officer| AD1[Admin Login]
    AD1 --> AD2[Dashboard and Workflow Home]
    AD2 --> AD3[Open Migration]
    AD3 --> AD4[Download Sample Format]
    AD4 --> AD5[Fill Campus Student Data in Excel or CSV]
    AD5 --> AD6[Upload File]
    AD6 --> AD7{Valid Format and Schema?}
    AD7 -->|No| AD8[Show Validation Errors]
    AD8 --> AD6
    AD7 -->|Yes| AD9[Normalize and Map to Canonical Contract]
    AD9 --> AD10[Campus Predictor Service]
    AD10 --> AD11[Generate Campus Predictions and Analytics]
    AD11 --> AD12[Show Insights Lab Charts]
    AD11 --> AD13[Create Predicted Output Sheet]
    AD13 --> AD14[Download Generated Sheet]

    AD12 --> RP1[Open Reports]
    RP1 --> RP2[Apply Filters: Student Branch Company Status CGPA]
    RP2 --> RP3[Switch Charts: Bar Line Pie Area]
    RP3 --> RP4[Review Table and KPI Summary]
    RP4 --> RP5[Export PDF and Summary]

    %% Student branch
    B -->|Student| ST1[Student Login]
    ST1 --> ST2[Open Student Analyzer]
    ST2 --> ST3{Student has Resume?}
    ST3 -->|Yes| ST4[Upload Resume]
    ST4 --> ST5[Resume Parser Optional Module]
    ST5 --> ST6[Autofill Student Profile Fields]
    ST3 -->|No| ST7[Fill Required Student Information]
    ST6 --> ST8[Student Predictor Service]
    ST7 --> ST8
    ST8 --> ST9[Get Placement Probability and Predicted Salary]
    ST9 --> ST10[Show Top Improvement Factors]
    ST10 --> ST11[Get Skill Recommendations Optional]
    ST11 --> ST12[Save Plan in Student Workflow]

    %% Merge execution track from implementation plan
    CR[[Merge Execution Track]] --> P0[Phase 0 Discovery Freeze\nLicense check and schema mapping]
    P0 --> P1[Phase 1 Contracts and Mocks\nOpenAPI and frontend mock data]
    P1 --> P2[Phase 2 Campus Predictor Integration]
    P2 --> P3[Phase 3 Student Predictor Integration]
    P3 --> P4[Phase 4 Optional Resume and Skill APIs]
    P4 --> P5[Phase 5 Hardening\nTests retries error boundaries]
    P5 --> REL[Release]

    AD14 --> E([End])
    RP5 --> E
    ST12 --> E

    %% Where runtime features connect to phases
    AD10 -. implemented in .-> P2
    ST8 -. implemented in .-> P3
    ST5 -. optional in .-> P4
    ST11 -. optional in .-> P4
    RP5 -. validated in .-> P5

    classDef startend fill:#f7d9d9,stroke:#bf5f5f,color:#111;
    classDef process fill:#f6efcc,stroke:#c4a544,color:#111;
    classDef decision fill:#dcefdc,stroke:#6ca56c,color:#111;
    classDef reports fill:#e6dcf7,stroke:#8f75c7,color:#111;
    classDef phase fill:#dce9ff,stroke:#5d8ac5,color:#111;

    class A,E startend;
    class AD1,AD2,AD3,AD4,AD5,AD6,AD8,AD9,AD10,AD11,AD12,AD13,AD14,ST1,ST2,ST4,ST5,ST6,ST7,ST8,ST9,ST10,ST11,ST12 process;
    class B,AD7,ST3 decision;
    class RP1,RP2,RP3,RP4,RP5 reports;
    class CR,P0,P1,P2,P3,P4,P5,REL phase;
```

## Notes
- This diagram is planning-focused and based on our merge plan.
- Optional modules are marked as optional.
- Do not directly copy donor repo files without confirming license and attribution requirements.
