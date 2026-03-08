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
            Make the number match the goal.
        `,
        "4k3/8/8/5p2/8/8/8/2R5 w K - 0 1",
        [
            {x: 4, y: 4, count: 1}
        ],
        3
    ),
    Level(
        "Pin",
        `
            Moves that leave the king under attack don't count for the number.
            So pinned pieces don't add or subtract.
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
        "7b/4n1qk/8/6pb/8/2Ppp3/PP4P1/R3K3 w Q - 0 1",
        [
            {x: 2, y: 5, count: 1}
        ],
        4
    )
];