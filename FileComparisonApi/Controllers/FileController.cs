using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileComparisonApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FileController : ControllerBase
    {
        [HttpPost("compare")]
        public async Task<IActionResult> CompareFiles([FromForm] IFormFile file1, [FromForm] IFormFile file2)
        {
            if (file1 == null || file2 == null)
                return BadRequest("Both files are required.");

            if (file1.Length == 0 || file2.Length == 0)
                return BadRequest("Files cannot be empty.");

            string text1, text2;
            using (var reader = new StreamReader(file1.OpenReadStream(), Encoding.UTF8))
                text1 = await reader.ReadToEndAsync();

            using (var reader = new StreamReader(file2.OpenReadStream(), Encoding.UTF8))
                text2 = await reader.ReadToEndAsync();

            var differences = CompareTextFiles(text1, text2);
            return Ok(new { Differences = differences});
        }

        private List<string> CompareTextFiles(string text1, string text2)
        {
            var lines1 = text1.Split('\n');
            var lines2 = text2.Split('\n');
            var differences = new List<string>();

            int maxLines = Math.Max(lines1.Length, lines2.Length);
            for (int i = 0; i < maxLines; i++)
            {
                string line1 = i < lines1.Length ? lines1[i] : "";
                string line2 = i < lines2.Length ? lines2[i] : "";

                if (!line1.Equals(line2, StringComparison.OrdinalIgnoreCase))
                    differences.Add($"Line {i + 1}: '{line1}' != '{line2}'");
            }

            return differences;
        }
    }
}
