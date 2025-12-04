/**
 * Vector.js
 * A robust 2D vector math library for physics calculations
 */
class Vector {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    // Add another vector to this one
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    // Subtract another vector from this one
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    // Multiply by a scalar
    mult(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }

    // Divide by a scalar
    div(n) {
        if (n !== 0) {
            this.x /= n;
            this.y /= n;
        }
        return this;
    }

    // Get magnitude (length)
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // Normalize (set length to 1)
    normalize() {
        const m = this.mag();
        if (m !== 0) {
            this.div(m);
        }
        return this;
    }

    // Limit magnitude to max
    limit(max) {
        if (this.mag() > max) {
            this.normalize();
            this.mult(max);
        }
        return this;
    }

    // Set magnitude
    setMag(n) {
        this.normalize();
        this.mult(n);
        return this;
    }

    // Get heading (angle in radians)
    heading() {
        return Math.atan2(this.y, this.x);
    }

    // Create a copy
    copy() {
        return new Vector(this.x, this.y);
    }

    // Static methods for creating new vectors
    static add(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
    }

    static sub(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }

    static mult(v, n) {
        return new Vector(v.x * n, v.y * n);
    }

    static fromAngle(angle) {
        return new Vector(Math.cos(angle), Math.sin(angle));
    }

    static random2D() {
        return Vector.fromAngle(Math.random() * Math.PI * 2);
    }

    static dist(v1, v2) {
        const dx = v1.x - v2.x;
        const dy = v1.y - v2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
