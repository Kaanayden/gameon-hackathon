import os
import argparse
import xml.etree.ElementTree as ET
import subprocess

def ensure_rsvg_convert():
    """Check if rsvg-convert is installed, if not provide installation instructions."""
    try:
        subprocess.run(['rsvg-convert', '--version'], capture_output=True)
    except FileNotFoundError:
        print("rsvg-convert is not installed. Please install it using:")
        print("brew install librsvg")
        exit(1)

def create_svg_from_group(g_element, x_offset=0, y_offset=0):
    """Create a new SVG string from a group element."""
    # Remove the transform attribute
    if 'transform' in g_element.attrib:
        del g_element.attrib['transform']

    # Create new SVG content
    svg_content = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
'''
    # Convert the group element back to a string
    g_content = ET.tostring(g_element, encoding='unicode')

    svg_content += g_content + '\n</svg>'
    return svg_content

def process_svg_file(svg_file_path, output_dir, scale_factor=2):
    """Process the SVG file and extract all <g> elements."""
    # Ensure rsvg-convert is installed
    ensure_rsvg_convert()

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Parse the SVG file
    tree = ET.parse(svg_file_path)
    root = tree.getroot()

    # Define the namespace
    namespaces = {'svg': 'http://www.w3.org/2000/svg'}

    # Find all g elements
    g_elements = root.findall('.//svg:g', namespaces)

    if not g_elements:
        print("No <g> elements found in the SVG file!")
        return

    print(f"Found {len(g_elements)} group elements")

    # Process each group
    for index, g_element in enumerate(g_elements):
        # Create temporary SVG file
        temp_svg = f"temp_{index}.svg"

        # Generate SVG content for this group
        svg_content = create_svg_from_group(g_element)

        # Save temporary SVG file
        with open(temp_svg, 'w', encoding='utf-8') as f:
            f.write(svg_content)

        # Convert to PNG
        output_path = os.path.join(output_dir, f'tile_{index}.png')
        final_size = 32 * scale_factor

        try:
            # Convert using rsvg-convert
            subprocess.run([
                'rsvg-convert',
                '-w', str(final_size),
                '-h', str(final_size),
                temp_svg,
                '-o', output_path
            ], check=True)

            print(f"Generated: {output_path}")

        except subprocess.CalledProcessError as e:
            print(f"Error converting {temp_svg}: {e}")

        finally:
            # Clean up temporary file
            if os.path.exists(temp_svg):
                os.remove(temp_svg)

def main():
    parser = argparse.ArgumentParser(description='Extract and convert <g> elements from SVG to PNG files')
    parser.add_argument('input_svg', help='Path to the input SVG file')
    parser.add_argument('-o', '--output', default='tiles', help='Output directory for PNG files (default: tiles)')
    parser.add_argument('-s', '--scale', type=int, default=2, help='Scale factor for output images (default: 2)')

    args = parser.parse_args()

    if not os.path.exists(args.input_svg):
        print(f"Error: Input file '{args.input_svg}' not found!")
        return

    try:
        process_svg_file(args.input_svg, args.output, args.scale)
        print(f"\nConversion complete! Files saved to: {os.path.abspath(args.output)}")
    except Exception as e:
        print(f"Error during conversion: {str(e)}")

if __name__ == "__main__":
    main()