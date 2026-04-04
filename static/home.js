var typedWord = new Typed("#auto-typed", {
  strings: ["Dental Education", "Clinical Dentistry"],
  typeSpeed: 150,
  backSpeed: 100,
  loop: true,
});

var tl = gsap.timeline({
  scrollTrigger: {
    trigger: "#dr-molar-ai-home-img",
    scroller: "body",
    start: "top 60%",
    end: "top 50%",
    scrub: 2,
  }
});
tl.from(
  "#dr-molar-ai-home-img",
  {
    x: -10,
  },
  "home-ai-anim"
);
tl.from(
  "#dr-molar-ai-home-content",
  {
    x: 10,
  },
  "home-ai-anim"
);
tl.to(
  "#dr-molar-ai-home-img",
  {
    scale: 1.3,
  },
  "home-ai-anim"
);