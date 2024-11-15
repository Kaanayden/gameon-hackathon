import os
import argparse
import xml.etree.ElementTree as ET
import subprocess
from copy import deepcopy

def ensure_rsvg_convert():
    """Check if rsvg-convert is installed, if not provide installation instructions."""
    try:
        subprocess.run(['rsvg-convert', '--version'], capture_output=True)
    except FileNotFoundError:
        print("rsvg-convert is not installed. Please install it using:")
        print("brew install librsvg")
        exit(1)

def remove_xmlns_attributes(element):
    """Recursively remove xmlns attributes from the element and its descendants."""
    if 'xmlns' in element.attrib:
        del element.attrib['xmlns']
    for child in element:
        remove_xmlns_attributes(child)

def create_svg_from_element(element):
    """Create a new SVG string from an element, including any inner SVGs."""
    # Remove the transform attribute if present
    if 'transform' in element.attrib:
        del element.attrib['transform']

    # Remove xmlns attributes to prevent redefinition
    remove_xmlns_attributes(element)

    # Check if the element is a <g> or an inner <svg>
    if element.tag.endswith('g'):
        # Create a new root SVG element
        svg_attrib = {
            'xmlns': 'http://www.w3.org/2000/svg',
            'viewBox': '0 0 32 32'
        }
        new_svg = ET.Element('svg', svg_attrib)
        # Append the group element to the new SVG
        new_svg.append(element)
    elif element.tag.endswith('svg'):
        # Use the inner <svg> element as is, after removing conflicting attributes
        new_svg = element
        # Ensure the root has the correct xmlns attribute
        new_svg.set('xmlns', 'http://www.w3.org/2000/svg')
    else:
        # Skip elements that are not <g> or <svg>
        return None

    # Convert the new SVG element tree to a string
    svg_content = ET.tostring(new_svg, encoding='unicode')

    return svg_content

def process_svg_file(svg_file_path, output_dir, scale_factor=2):
    """Process the SVG file and extract all relevant elements."""
    # Ensure rsvg-convert is installed
    ensure_rsvg_convert()

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Parse the SVG file
    tree = ET.parse(svg_file_path)
    root = tree.getroot()

    # Define the namespace
    namespaces = {'svg': 'http://www.w3.org/2000/svg'}

    # List to hold elements to process
    elements_to_process = []

    # Iterate over direct children of the root
    for child in root:
        if child.tag == '{http://www.w3.org/2000/svg}g' or child.tag == '{http://www.w3.org/2000/svg}svg':
            elements_to_process.append(child)

    if not elements_to_process:
        print("No relevant elements found in the SVG file!")
        return

    print(f"Found {len(elements_to_process)} elements to process")

    # Process each element
    for index, element in enumerate(elements_to_process):
        # Create a deep copy of the element to avoid modifying the original tree
        element_copy = deepcopy(element)

        # Generate SVG content for this element
        svg_content = create_svg_from_element(element_copy)

        if svg_content is None:
            continue  # Skip if the element is not a <g> or <svg>

        # Create temporary SVG file
        temp_svg = f"temp_{index}.svg"

        # Save temporary SVG file
        with open(temp_svg, 'w', encoding='utf-8') as f:
            f.write(svg_content)

        # Convert to PNG
        output_path = os.path.join(output_dir, f'tile_{index}.png')
        final_size = 32 * scale_factor

        # Adjust size if the element is an inner <svg> with a different viewBox
        if element.tag.endswith('svg'):
            # Get viewBox dimensions
            viewBox = element_copy.get('viewBox')
            if viewBox:
                _, _, width, height = map(float, viewBox.strip().split())
                final_size_w = int(width * scale_factor)
                final_size_h = int(height * scale_factor)
            else:
                final_size_w = final_size_h = final_size
        else:
            final_size_w = final_size_h = final_size

        try:
            # Convert using rsvg-convert
            subprocess.run([
                'rsvg-convert',
                '-w', str(final_size_w),
                '-h', str(final_size_h),
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
    parser = argparse.ArgumentParser(description='Extract and convert elements from SVG to PNG files')
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