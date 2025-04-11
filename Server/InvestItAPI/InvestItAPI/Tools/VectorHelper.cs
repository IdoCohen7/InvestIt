using Microsoft.ML;
using Microsoft.ML.Transforms.Text;
using System.Linq;

public class VectorHelper
{
    private static readonly MLContext mlContext = new MLContext();

    public static float[] ConvertTextToVector(string text)
    {
        var data = new[] { new TextData { Text = text } };
        var dataView = mlContext.Data.LoadFromEnumerable(data);

        var pipeline = mlContext.Transforms.Text.FeaturizeText("Features", nameof(TextData.Text));
        var transformer = pipeline.Fit(dataView);
        var transformedData = transformer.Transform(dataView);

        var features = mlContext.Data.CreateEnumerable<VectorData>(transformedData, reuseRowObject: false).FirstOrDefault();
        return features?.Features ?? new float[0];
    }

    private class TextData { public string Text { get; set; } }
    private class VectorData { public float[] Features { get; set; } }
}
