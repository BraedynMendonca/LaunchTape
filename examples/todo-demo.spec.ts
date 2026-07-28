import { test, expect } from "../src/fixture.js";

test("ship a focused day", async ({ page, demo }) => {
  await page.setContent(`
    <style>
      * { box-sizing: border-box }
      body { margin: 0; background: #f5f4ef; color: #171717; font: 18px/1.45 system-ui; }
      main { width: min(760px, 86vw); margin: 9vh auto; }
      h1 { font-size: 56px; letter-spacing: -3px; margin: 0 0 8px; }
      p { color: #666; }
      .card { background: white; border: 1px solid #deddd7; border-radius: 20px; padding: 28px; box-shadow: 0 18px 60px #302d2114; }
      form { display: flex; gap: 10px; }
      input { flex: 1; padding: 15px 17px; border: 1px solid #ccc; border-radius: 12px; font: inherit; }
      button { border: 0; border-radius: 12px; padding: 0 22px; background: #6d4aff; color: white; font: 700 16px system-ui; }
      li { margin-top: 14px; padding: 16px; border-radius: 12px; background: #f7f6f2; list-style: none; }
      ul { padding: 0; }
    </style>
    <main>
      <h1>Today, clearly.</h1>
      <p>A tiny plan for your highest-leverage work.</p>
      <section class="card">
        <form>
          <input aria-label="Task" placeholder="What matters today?" />
          <button>Add task</button>
        </form>
        <ul></ul>
      </section>
    </main>
    <script>
      document.querySelector('form').addEventListener('submit', (event) => {
        event.preventDefault();
        const input = document.querySelector('input');
        const item = document.createElement('li');
        item.textContent = input.value;
        document.querySelector('ul').append(item);
        input.value = '';
      });
    </script>
  `);

  await demo.chapter("Plan the day", {
    description: "Turn a vague intention into one clear next step."
  });
  await page.getByLabel("Task").fill("Publish the launch page");
  await page.getByRole("button", { name: "Add task" }).click();
  await expect(page.getByRole("listitem")).toHaveText("Publish the launch page");
  await demo.caption("One priority. Ready to ship.");
  await demo.shot("finished-state");
  await demo.pause();
});
