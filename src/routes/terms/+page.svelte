<script lang="ts">
  import { ArrowLeft } from '@lucide/svelte';

  import { IsWithinViewport } from '$lib/helpers/index.js';

  let target = $state<HTMLElement | null>(null);

  const isWithinViewport = new IsWithinViewport(() => target);
</script>

<header class="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-sm">
  <div
    class={[
      'absolute inset-x-0 top-full h-px bg-transparent transition-colors duration-300',
      !isWithinViewport.current && '!bg-slate-950/7.5',
    ]}
  ></div>

  <div class="mx-auto flex max-w-5xl px-4 py-3">
    <a
      href="/"
      class="rounded-full p-4 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
    >
      <ArrowLeft />
    </a>
  </div>
</header>

<div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

<main class="mx-auto flex max-w-5xl flex-col gap-y-5 px-4 py-25">
  <h1 class="text-2xl font-bold">TERMS OF USE</h1>

  <div class="flex flex-col gap-y-3">
    <b>Acceptance of Agreement</b>
    <p>
      Thank you for visiting Glow, a web application of the Ministry of Education ("MOE"). You are
      required to read, acknowledge and agree to these Terms of Use upon initial login to be granted
      access to Glow. If you do not agree to these Terms of Use, please do not access or use Glow.
    </p>

    <p>
      MOE reserves the right to change these Terms of Use from time to time at its sole discretion.
      All changes will be posted on this page, and your continued use of Glow after such changes
      constitutes your unconditional agreement to the modified Terms of Use.
    </p>

    <b>Authentication and Access</b>
    <p>
      Access to Glow is restricted to MOE staff using their ICON email accounts (@moe.edu.sg or
      @moe.gov.sg). Users must authenticate using their ICON credentials to access the platform.
    </p>

    <b>User's Responsibility</b>
    <p>
      You agree to use Glow only for lawful purposes and in a way that does not infringe the rights
      of, restrict or inhibit anyone else's use and enjoyment of Glow. Prohibited behaviour includes
      harassing or causing distress to any person, transmitting obscene or offensive content or
      disrupting the normal flow of dialogue within Glow.
    </p>

    <p>MOE reserves the right to:</p>
    <ul role="list" class="list-disc pl-5">
      <li>Log off or deactivate accounts that are inactive for an extended period</li>
      <li>
        Immediately deactivate or terminate any accounts that have breached any part of the Terms of
        Use
      </li>
    </ul>

    <b>Contributions and Submissions</b>
    <p>When you upload or post any content to Glow, you:</p>
    <ol class="list-decimal pl-5" role="list">
      <li>
        Grant MOE a perpetual, worldwide, non-exclusive, royalty-free licence to use and distribute
        the content
      </li>
      <li>
        Warrant that the uploaded content:
        <ul role="list" class="list-disc pl-5">
          <li>Is your own original work or properly licensed</li>
          <li>Is not defamatory</li>
          <li>Does not infringe any law</li>
        </ul>
      </li>
      <li>
        Agree to indemnify MOE against all legal fees, damages and expenses that may result from
        your breach of the above warranty
      </li>
    </ol>

    <p>MOE reserves the right to:</p>
    <ul role="list" class="list-disc pl-5">
      <li>Access or examine any uploaded content</li>
      <li>Move, remove or disable access to any content</li>
      <li>Disable any inappropriate links or content</li>
    </ul>

    <b>Intellectual Property Rights</b>
    <p>
      The copyright and intellectual property rights in all content on Glow are owned by, licensed
      to, or controlled by MOE or third parties. Users are granted a personal, non-transferable,
      non-exclusive right to use the content for non-commercial educational purposes only.
    </p>

    <b>IT Security</b>
    <p>You agree to:</p>
    <ul role="list" class="list-disc pl-5">
      <li>Keep your ICON password confidential and private</li>
      <li>Not misuse your account or the Glow system</li>
      <li>Comply with MOE's End User ICT Security Policy</li>
      <li>Not use any automated means to monitor or copy Glow</li>
      <li>Not interfere with the proper working of Glow</li>
    </ul>

    <b>Disclaimers</b>
    <ol class="list-decimal pl-5" role="list">
      <li>Third Party Links: MOE is not responsible for external websites linked from Glow</li>
      <li>Content: Glow and its content are provided "as-is, where-is" without warranties</li>
      <li>
        Security: While MOE uses available technology to protect communications, we are not liable
        for security breaches
      </li>
      <li>User Content: You are responsible for content you submit to Glow</li>
    </ol>

    <b>Governing Law</b>
    <p>
      These Terms of Use and the use of Glow are governed by Singapore law. Any legal proceedings
      relating to Glow will be brought solely in Singapore courts.
    </p>
  </div>
</main>
