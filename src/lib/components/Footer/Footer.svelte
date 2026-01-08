<script lang="ts">
  const currentYear = new Date().getFullYear();
</script>

<div class="flex w-full flex-col gap-6 bg-black p-8">
  <ul class="flex flex-col items-start gap-y-4 text-white sm:flex-row sm:items-center sm:gap-6">
    <li>
      <a href="/terms" target="_blank" rel="noopener noreferrer" class="hover:underline">
        Terms of Use
      </a>
    </li>
    <li>
      <a href="/privacy" target="_blank" rel="noopener noreferrer" class="hover:underline">
        Privacy Policy
      </a>
    </li>
    <li>
      <a
        href="https://tech.gov.sg/report_vulnerability"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:underline"
      >
        Report Vulnerability
      </a>
    </li>
    <li>
      <a
        href="https://form.gov.sg/68b7d5099b55d364153be0d5"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:underline"
      >
        Reach Us
      </a>
    </li>
  </ul>
  <div class="text-white">&copy; {currentYear}, Government of Singapore</div>
</div>
