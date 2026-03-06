const levels = [
    Level(
        "Tutorial",
        `Move the king to attack the marked square.`,
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
    )
];