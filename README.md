
https://devpost.com/software/autotruth-ai

# Contract Checker – Detect Hidden Car Dealership Fees

Buying a car can be stressful. Knowing which car is reliable and right for you is hard enough, but many dealerships make it even tougher by adding hidden terms and extra fees. These clauses can make the purchasing process confusing and costly.

**Contract Checker** helps solve this problem. Our web application allows users to upload their dealership contract and automatically scans for suspicious terms, hidden fees, or misleading practices. Users receive clear explanations of potential issues before signing.

---

## What It Does

* Upload your car purchase contract directly to the site.
* The system analyzes the document using the **Gemini API**.
* It highlights any questionable clauses, hidden fees, or unfair terms.
* It provides a clear explanation and a reliability score for the deal.

---

## How We Built It

* **Gemini API** – used for natural language processing and contract analysis
* **Next.js** and **TypeScript (TSX)** – frontend framework and development
* **Netlify** – deployment and hosting
* **GitHub** – version control and collaboration

A major challenge we faced was structuring the API responses in a format we could use effectively. By designing a highly specific prompt, we were able to make the Gemini API return consistent and predictable data for analysis.

---

## Challenges We Overcame

* Parsing and organizing API outputs for consistent results
* Detecting hidden or misleading terms without false positives
* Integrating AI results into a clean, user-friendly interface

---

## Try It Out

* **Live Demo:** [View Project on Netlify](#)
* **GitHub Repository:** [Contract Checker Repo](#)
* **Demo Video:** [Watch on YouTube](https://www.youtube.com/watch?v=BUtizdvIeEo)

---

## Submitted To

**HackDavis 2025**

---

## Team

**Kevin Zhen** – Team Lead and Backend Developer
**Aditya Vanswala** – Frontend Developer and Backend Support
**Saket Gupta** – Frontend Developer

---

## Acknowledgments

Built at **HackDavis 2025** to make car buying more transparent and fair for everyone.
https://devpost.com/software/autotruth-ai
---



