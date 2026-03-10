const levels = [
    Level(
        "Tutorial",
        `
            Move the king to attack the marked square.
            You have a limited number of moves.
        `,
        "4k3/8/8/8/8/8/8/4K3 w K - 0 1",
        [
            {x: 4, y: 4, count: 1}
        ],
        2
    ),
    Level(
        "Capture",
        `
            When a white piece attacks a square, it adds 1.
            When a black piece attacks a square, it subtracts 1.
            The square shows "-1/1" because there is 1 black piece attacking,
            and you need to get the number to 1.
        `,
        "4k3/4p3/4n3/4bp2/8/8/8/2R5 w K - 0 1",
        [
            {x: 4, y: 4, count: 1}
        ],
        3
    ),
    Level(
        "Take the center",
        `
            Let's get control over the center.
        `,
        "4k3/3pb3/2n2n2/8/8/4B3/4PPP1/1N2KB2 w - - 0 1",
        [
            {x: 3, y: 3, count: 3}
        ],
        5
    ),
    Level(
        "Pin",
        `
            Moves that leave the king under attack don't count for the number.
            Pinned pieces don't add or subtract.
        `,
        "4k3/8/2n1p3/3p4/6p1/7B/8/4K2R w K - 0 1",
        [
            {x: 4, y: 3, count: 1}
        ],
        3
    ),
    Level(
        "Pawn House",
        `
            Spooky scary queen and bishop battery.
        `,
        "7b/4n1qk/3p4r/3P2pb/4n3/2Ppp3/PP4Pp/R3K3 w Q - 0 1",
        [
            {x: 3, y: 4, count: 1}
        ],
        4
    )
];