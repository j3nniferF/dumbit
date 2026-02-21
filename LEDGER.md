/_ Remove card borders in both modes. _/
.card--tasks,
.card--completed,
.pg-mode .card--tasks,
.pg-mode .card--completed,
body:not(.pg-mode) .card--tasks,
body:not(.pg-mode) .card--completed {
/_ border: none !important; _/
clip-path: none !important;
}

    background: #ffffff !important;
    background-image: none !important;
    border: 1px solid #e0e0e0 !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
    border-radius: 12px !important;
    clip-path: none !important;
    position: relative;
    border: 2px solid transparent !important;
    background: linear-gradient(#fff, #fff) padding-box,
    linear-gradient(
        90deg,
        #2563eb 0%,
        #60a5fa 25%,
        #f59e0b 50%,
        #f472b6 75%,
        #2563eb 100%
      )
      border-box !important;
    animation: sparkleRotate 3s linear infinite;



    .pg-mode .tabs,

.pg-mode .pg-switch,
.pg-mode div .streak-badge,
.pg-mode .card--tasks,
.pg-mode .card--completed {
