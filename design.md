# Product Design Guide v1.1

This document is the single source of truth for our product's user interface and experience. It defines a system deeply rooted in the philosophy and execution of world-class tools like **Linear.app**. It is written to be parsed by AI and human developers alike. Adherence to these principles is not optional; it is fundamental to our identity.

---

## 1.0 Our Philosophy

Our design is not a series of subjective choices. It is a system guided by a core philosophy, with **Linear.app** serving as our primary benchmark for quality, speed, and intentionality.

* **1.1 Clarity through Subtraction:** Our primary goal is to reduce cognitive load. If an element does not serve a critical function, it must be removed. We follow the principle that the best products are not just built, they are edited.
* **1.2 Velocity is a Feature:** The interface must be, and feel, instantaneous. We believe performance is a core part of the user experience, a standard set by tools like **Linear**. Interactions should be immediate, and animations must be purposeful, never decorative.
* **1.3 Crafted, Not Assembled:** Every component is considered and designed with care. We do not use default styles. We build with precision to create a cohesive experience that feels like magic, a hallmark of the **Linear** school of thought.
* **1.4 Keyboard-First:** The most efficient path is through the keyboard. The entire application must be navigable and operable without a mouse.

---

## 2.0 Brand Identity

* **2.1 Voice:** Confident, direct, and intelligent.
* **2.2 Tone:** Professional, calm, and focused. Our language must reflect that we are a tool for professionals. We do not use exclamation points.
* **2.3 Logo Usage:** The logomark must be used as provided, with appropriate clear space. Do not alter, rotate, or embellish it.

---

## 3.0 Visual Language

Our visual language is intentionally constrained and monochromatic, drawing direct inspiration from the high-contrast, focused aesthetic of **Linear**.

### 3.1 Colors (Dark Mode First)

Our palette is monochromatic, using color only for intentional highlights and status indicators.

| Role             | Hex Code  | Usage                                                                                    |
| :--------------- | :-------- | :--------------------------------------------------------------------------------------- |
| `Background`     | `#111113` | The primary, deepest background color.                                                   |
| `Subtle Background`| `#18181A` | For cards, inputs, and elevated surfaces.                                                |
| `Border`         | `#252528` | For all borders, dividers, and outlines.                                                 |
| `Primary Text`   | `#F9F9FA` | For all primary text content.                                                            |
| `Secondary Text` | `#A3A3A5` | For metadata, helper text, and disabled text.                                            |
| `Accent`         | `#6A4CFF` | **Primary Action Color.** For primary buttons, focus rings, and key highlights. Use sparingly. |
| `Destructive`    | `#E5484D` | For destructive actions (e.g., delete).                                                  |

### 3.2 Typography

We use a single font family to ensure consistency, performance, and the clean aesthetic seen in **Linear.app**.

* **Font Family:** Inter
* **Typographic Scale:**

| Element          | Font Size | Font Weight     | Letter Spacing | Usage                                    |
| :--------------- | :-------- | :-------------- | :------------- | :--------------------------------------- |
| `H1 (Page Title)`| `28px`    | `600 (SemiBold)`| `-0.02em`      | Main page or view title.                 |
| `H2 (Section Head)`| `20px`    | `600 (SemiBold)`| `-0.015em`     | Major section headings.                  |
| `Body`           | `15px`    | `400 (Regular)` | `0em`          | Standard text for paragraphs and lists.  |
| `Subtle/Meta`    | `13px`    | `400 (Regular)` | `0em`          | Helper text, metadata, timestamps.       |
| `Button`         | `14px`    | `500 (Medium)`  | `0em`          | Text within buttons.                     |

### 3.3 Iconography

* **Style:** Minimalist, sharp, with a `1.5px` stroke weight. The style should feel precise and professional.
* **Color:** Icons use `Secondary Text` (`#A3A3A5`) by default. On hover or active states, they can use `Primary Text` (`#F9F9FA`).
* **Size:** Standard icon size is `16x16px`.

### 3.4 Borders & Shadows

* **Borders:** All borders are `1px` solid, using the `Border` color (`#252528`).
* **Corner Radius:** Use a `4px` border-radius for subtle softness on cards and inputs. Buttons have a `3px` radius.
* **Shadows:** Shadows are used exclusively for elevation (e.g., modals, command menus). They are never used for decoration.
    * **Modal Shadow:** `box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.3);`

---

## 4.0 Layout & Spacing

Our spatial system is based on a strict 8px grid.

* **Grid Unit:** `1 unit = 8px`. All padding, margins, and component dimensions must be a multiple of 8px.
* **Content Width:** Main content columns have a `max-width` of `800px` and are centered on the page.
* **Negative Space:** Be generous with whitespace. It is our primary tool for creating focus.

---

## 5.0 Core Components & States

Components must respond predictably to user interaction.

### 5.1 Buttons

| State             | Visual Style                                                                 | Notes                                       |
| :---------------- | :--------------------------------------------------------------------------- | :------------------------------------------ |
| **Default (Primary)** | Background: `Accent` (`#6A4CFF`), Text: `Primary Text` (`#F9F9FA`)           | The go-to for primary actions.              |
| **Default (Secondary)**| Background: `Subtle Background` (`#18181A`), Border: `Border` (`#252528`), Text: `Primary Text` | For secondary, non-critical actions.        |
| **Hover** | Background brightens by 10%.                                                 | Provides immediate feedback.                |
| **Active/Pressed** | Background darkens by 5%. Element moves down `1px`.                          | Confirms the user's click.                  |
| **Focus** | A `2px` outer ring using `Accent` color with 50% opacity.                    | Critical for keyboard accessibility.        |
| **Disabled** | Background: `Subtle Background`, Text: `Secondary Text` with 50% opacity. `cursor: not-allowed`. | Clearly indicates an unavailable action.    |

### 5.2 Input Fields

| State     | Visual Style                                                       | Notes                           |
| :-------- | :----------------------------------------------------------------- | :------------------------------ |
| **Default** | Background: `Subtle Background` (`#18181A`), `1px` `Border`, Text: `Primary Text` | Clean and unobtrusive.          |
| **Hover** | Border color brightens slightly.                                   | Invites interaction.            |
| **Focus** | Border color changes to `Accent` (`#6A4CFF`).                      | Clearly indicates the active input field. |
| **Disabled**| Same as Button `Disabled`.                                       |                                 |

---

## 6.0 Interaction Patterns

* **6.1 Command Menu (`⌘+K`):** The Command Menu is the central nervous system of the app, a pattern popularized and perfected by tools like **Linear**. It is our primary method for navigation and executing commands and must be accessible from anywhere.
* **6.2 Toasts (Notifications):** For non-blocking feedback (e.g., "Idea archived"), use a subtle toast notification that appears and disappears automatically. **Do not use modals for simple confirmations.**
* **6.3 Contextual Menus:** Right-clicking on an item should reveal a menu of available actions for that specific item. This keeps the primary UI clean, a core tenet of the **Linear** experience.
* **6.4 Animation:** All animations must be fast and purposeful. Use a standard `cubic-bezier(0.4, 0, 0.2, 1)` for all transitions. Duration should be between `100ms` and `200ms`.

---

## 7.0 Accessibility (A11y)

Accessibility is not an afterthought; it is a requirement.

* **7.1 Contrast:** All text must meet WCAG AA contrast ratios.
* **7.2 Keyboard Navigation:** Every interactive element must be reachable and operable via the `Tab` and `Enter`/`Space` keys.
* **7.3 ARIA Roles:** Use appropriate ARIA attributes to define roles and states for non-native HTML elements.

---

## 8.0 The Final Rule

When a design choice is unclear, refer back to **Principle 1.1: Clarity through Subtraction**. The simplest solution is almost always the correct one.