---
title: 'The Value of TailwindCSS'
date: '2023-10-11'
cover: ''
tag: ['CSS']
---
Tailwind has always been criticized, with the most common complaint being "Why not just write inline styles directly?".
In fact, Tailwind is not just about shorthand style names; it is a series of convenient encapsulations.

# Animation
For example, the `animate-spin` property is used to add a spinning animation, commonly used in loading. If you were to write this in traditional CSS/Sass, you would need at least the following code.
```css
animation: spin 1s linear infinite;

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

# Interaction
If you want a button to lighten its color on mouse hover, in Tailwind, you only need `hover:opacity-90`, while traditional CSS would require:
```css
.btn:hover {
  background-color: rgba(xxx,xxx,xxx, 0.9)
}
```

# Responsive Design
Many modern websites need to adapt to both large screen devices and small mobile screens. Typically, we use CSS3's `@media` to write different CSS based on window size.
```css
@media (max-width: 768px) {
  body {
    width: 80%
  }
}
```
With Tailwind, to adapt to devices with a width of 768px, you just need to add the `md` prefix before the style.
```html
<body class="md:w-4/5">
```

# Good for Non-Designers/Developers
For individuals or small teams developing products without professional designers providing designs, creating components can be quite painful. For example, the `box-shadow` property for buttons, cards, modals, each requiring different shadow styles. Tailwind CSS provides 7 different shadow options that are highly versatile. Now, to create a modern-looking button, you just need `class="shadow-md rounded-lg"`.

# New Component Pattern
Tailwind also has a derivative, Headless UI, which completely separates component functionality and style. Often, components have the same functionality but require different styles, or components that look the same need completely different APIs. Headless UI addresses this issue.

> NuxtLab UI is a headless Tailwind component library, worth checking out if you have spare time. The code is very clean.

# Classes Are Too Long
Here is a checkbox created with Tailwind, featuring animations and dark mode compatibility.
```html
<input type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
```
The length of these classes may seem overwhelming. However, Tailwind provides `@layer` and `@apply`, allowing you to organize Tailwind like traditional CSS, encapsulating your own style components.
```css
@layer components {
  .checkbox {
    @apply
    w-4
    h-4
    text-blue-600
    bg-gray-100
    border-gray-300
    rounded
    focus:ring-blue-500
    dark:focus:ring-blue-600
    dark:ring-offset-gray-800
    focus:ring-2
    dark:bg-gray-700
    dark:border-gray-600
  }
}
```
Dealing with overly long styles is inevitable, even if you write inline styles directly. Eventually, you will find yourself back on the path of encapsulating style components. However, all the benefits (abstraction, reduced code volume, responsiveness, etc.) are still there. This is also a form of the value of "not abstracting too early." With a small idea, you can quickly implement a prototype and later extract and maintain it, and Tailwind reduces the difficulty of this operation.

> Of course, these benefits are based on either having a diverse style of consumer-facing interfaces or needing to create your own team's component library. However, it is clear that most companies are still in the phase of using one-size-fits-all solutions like `element antd`. But this is certainly not a problem with Tailwind.

> In fact, the overseas `3T architecture (Next tRPC Tailwind)` has been popular for a while. Of course, you could say this is just frontend tinkering, but it is indeed a shortcut to creating "modern, visually appealing, and interactive interfaces."
