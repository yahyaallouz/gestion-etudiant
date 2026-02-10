import os
import zipfile

def create_zip(source_dir, output_filename):
    # Ensure processed paths are absolute
    source_dir = os.path.abspath(source_dir)
    
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Compute relative path
                relative_path = os.path.relpath(file_path, source_dir)
                # FORCE forward slashes for zip spec compliance / Linux compatibility
                zip_path = relative_path.replace(os.path.sep, '/')
                
                print(f"Adding: {zip_path}")
                zipf.write(file_path, zip_path)

if __name__ == "__main__":
    deploy_dir = r"c:\xampp\htdocs\GestionETD\deployment"
    zip_out = r"c:\xampp\htdocs\GestionETD\gestion_etudiant_deploy.zip"
    
    print(f"Zipping {deploy_dir} to {zip_out}...")
    create_zip(deploy_dir, zip_out)
    print("Zip creation complete.")
