// The object: the k = 0 slice of the filled quaternion Julia set for
// c = -0.2 + 0.8i, from Paul Bourke's catalogue. Because c is complex, the
// plane z = 0 cuts this solid exactly along the 2D Julia set of the same c.
// Shared by the page (home.js) and the journey's generator, which routes the
// camera clear of this solid (scripts/home-shots/).
export const SCENE = { c: [-0.2, 0.8, 0, 0], slice: 0, iter: 16 };
