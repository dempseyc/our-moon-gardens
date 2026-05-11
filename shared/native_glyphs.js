// READONLY FILE - DO NOT EDIT
// For size, glyphs measured from left front bottom corner. [x,y,z], where y is depth and z is height.
// Size is used for placement and collision, sprites are just for visuals, so they can be different
// for example a tile with a tall plant on it, would have a size of [1,1,1.5], but the sprite could be 64px wide and 128px tall.
// 64px is 1 unit. Size can be in 1/4 increments, so 16px of x or (on screen) 12px of y, since depth is projected 3/4.
const NATIVE_SPRITE_SHEET = "../src/assets/native_stickers/sprite_template_primatives_16_grid.png";
const NATIVE_SPRITES = {
    "meta": {
        "image": "NATIVE_SPRITE_SHEET",
        "height": 512,
        "width": 512,
        "cell": 64
    },
    "circle_flat": {
        "x": 0,
        "y": 0,
        "w": 64,
        "h": 64
    },
    "circle_thick": {
        "x": 64,
        "y": 0,
        "w": 64,
        "h": 64
    },
    "tile_flat": {
        "x": 128,
        "y": 0,
        "w": 64,
        "h": 64
    },
    "tile_thick": {
        "x": 192,
        "y": 0,
        "w": 64,
        "h": 64
    },
    "puddle": {
        "x": 256,
        "y": 0,
        "w": 128,
        "h": 64
    },
    "unit cube": {
        "x": 0,
        "y": 64,
        "w": 64,
        "h": 128
    },
    "nw_wall": {
        "x": 64,
        "y": 80,
        "w": 64,
        "h": 112
    },
    "we_wall": {
        "x": 128,
        "y": 128,
        "w": 64,
        "h": 64
    },
    "hole": {
        "x": 192,
        "y": 128,
        "w": 64,
        "h": 64
    },
    "unit_tile": {
        "x": 256,
        "y": 128,
        "w": 64,
        "h": 64
    },
    "sphere_sculpture": {
        "x": 320,
        "y": 96,
        "w": 64,
        "h": 96
    }
}


export const NATIVE_GLYPHS = {
    "meta": {
        "sprite_sheet": NATIVE_SPRITE_SHEET,
        "sprite_sheet_width": 512,
        "sprite_sheet_height": 512,
        "cell_size": 64
    },
    "glyphs": [
        {
            "name": "circle_flat",
            "source_type": "spritesheet",
            "sprites": [NATIVE_SPRITES["circle_flat"]],
            "footprint": [1, 1, 0]

        },
        {
            "name": "circle_thick",
            "source_type": "spritesheet",
            "sprites": [NATIVE_SPRITES["circle_thick"]],
            "footprint": [1, 1, 0.25]
        },
        {
            "name": "tile_flat",
            "source_type": "spritesheet",
            "sprites": [NATIVE_SPRITES["tile_flat"]],
            "footprint": [1, 1, 0]
        },
        {
            "name": "tile_thick",
            "source_type": "spritesheet",
            "sprites": [NATIVE_SPRITES["tile_thick"]],
            "footprint": [1, 1, 0.25]
        },
        {
            "name": "puddle",
            "source_type": "file",
            "sprites": ["../src/assets/native_stickers/puddle_animation.gif"],
            "footprint": [2, 1, 0]
        },
        {
            "name": "unit cube",
            "source_type": "spritesheet",
            "sprites": [NATIVE_SPRITES["unit cube"]],
            "footprint": [1, 1, 1]
        },
        {
            "name": "nw_wall",
            "source_type": "spritesheet",
            "sprites": [NATIVE_SPRITES["nw_wall"]],
            "footprint": [1, 1, 1]
        },
        {
            "name": "we_wall",
            "source_type": "spritesheet",
            "sprites": [NATIVE_SPRITES["we_wall"]],
            "footprint": [1, 1, 1]
        },
        {
            "name": "hole",
            "source_type": "spritesheet",
            "sprites": [NATIVE_SPRITES["hole"]],
            "footprint": [1, 1, 1]
        },
        {
            "name": "unit_tile",
            "source_type": "spritesheet",
            "sprites": [NATIVE_SPRITES["unit_tile"]],
            "footprint": [1, 1, 0.25]
        },
        {
            "name": "sphere_sculpture",
            "source_type": "spritesheet",
            "sprites": [NATIVE_SPRITES["sphere_sculpture"]],
            "footprint": [1, 1, 1]
        },
        {
            "name": "hosted_image_placeholder",
            "source_type": "link",
            "sprites": ["https://imgur.com/4AiXGZV.png"],
            "footprint": [1, 1, 0]
        }
    ]
}