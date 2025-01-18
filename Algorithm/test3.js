function section3(l, t) {
    const res = [];

    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    const combination = (nums, target, length, start, curr) => {
        if (curr.length === length && target === 0) {
            res.push([...curr]);
            return;
        }

        for (let i = start; i < nums.length; i++) {
            if (nums[i] <= target) {
                curr.push(nums[i]);
                combination(nums, target - nums[i], length, i + 1, curr);
                curr.pop();
            }
        }
    }

    combination(nums, t, l, 0, []);
    return res;
}

console.log(section3(4, 5))