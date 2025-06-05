import os
import subprocess

def optimize_png_with_pngquant(input_path, output_path, quality_min_max="65-80", speed="3", overwrite=False):
    """
    pngquant를 사용하여 PNG 이미지의 용량을 줄입니다.

    Args:
        input_path (str): 원본 PNG 이미지 경로
        output_path (str): 최적화된 PNG 이미지를 저장할 경로
        quality_min_max (str): pngquant의 품질 범위 (예: "65-80").
                                숫자가 낮을수록 압축률이 높고 화질 손실이 클 수 있습니다.
                                0-100 사이의 최소값과 최대값을 '-'로 연결합니다.
        speed (str): 압축 속도/품질 트레이드오프 (1-11). 1이 가장 높은 품질 (느림),
                     11이 가장 빠른 속도 (낮은 품질). 기본값은 3입니다.
        overwrite (bool): 원본 파일을 덮어쓸지 여부. True로 설정 시 output_path는 무시되고 input_path에 덮어씁니다.
                          (주의: 이 옵션은 원본 손실 위험이 있으므로 신중히 사용하세요.)
    """
    try:
        # pngquant 명령어 구성
        # Windows 사용자의 경우 'pngquant' 대신 'pngquant.exe' 경로를 직접 지정해야 할 수 있습니다.
        # 예: command = ['path/to/pngquant.exe', ...]
        command = ['pngquant']

        if overwrite:
            # 원본 파일 덮어쓰기 (pngquant는 기본적으로 덮어쓰지 않으므로 --force 와 --ext .png 필요)
            # 또는 output_path를 input_path와 동일하게 하고 --force 사용
            # 여기서는 output_path를 명시적으로 사용하고, 필요 시 호출하는 쪽에서 input/output 경로를 동일하게 설정
            command.extend(['--force']) # --output 옵션과 함께 사용 시 output 파일이 이미 존재하면 덮어씀
        else:
            # output_path가 input_path와 같으면 --force 옵션이 필요할 수 있음
            if input_path == output_path:
                 command.extend(['--force'])


        command.extend([
            '--quality=' + quality_min_max,
            '--speed=' + speed,
            '--output', output_path,
            input_path
        ])

        print(f"실행 명령어: {' '.join(command)}") # 디버깅을 위해 명령어 출력

        # pngquant 실행
        process = subprocess.run(command, capture_output=True, text=True, check=False) # check=False로 변경하여 직접 오류 처리

        if process.returncode == 0:
            original_size = os.path.getsize(input_path)
            optimized_size = os.path.getsize(output_path)

            print(f"이미지 최적화 완료 (pngquant): {output_path}")
            print(f"  - 원본 크기: {original_size / 1024:.2f} KB")
            print(f"  - 최적화된 크기: {optimized_size / 1024:.2f} KB")
            if original_size > 0:
                print(f"  - 용량 감소율: {(original_size - optimized_size) / original_size * 100:.2f}%")
            else:
                print(f"  - 원본 파일 크기가 0입니다.")
        elif process.returncode == 98 and os.path.exists(output_path):
            # 코드가 98인 경우는 이미지가 pngquant의 품질 기준을 충족하지 못하여
            # 원본보다 파일 크기가 커지는 등의 이유로 변환하지 않았을 때 발생할 수 있습니다.
            # 이 경우 output_path 파일이 생성되지 않거나, 원본과 동일할 수 있습니다.
            # Pillow와 달리 pngquant는 이럴 때 파일을 생성 안할 수 있습니다.
            # 만약 output_path에 파일이 이미 존재하고 사이즈가 같다면 원본 복사로 간주하거나,
            # 혹은 원본을 사용하도록 처리할 수 있습니다.
            # 여기서는 메시지를 출력하고 넘어갑니다.
            print(f"주의 ({os.path.basename(input_path)}): pngquant가 이미지를 변환하지 않았습니다 (종료 코드 98).")
            print(f"  - 원본 파일이 이미 최적화되었거나 품질 기준에 미치지 못할 수 있습니다.")
            print(f"  - stderr: {process.stderr.strip()}")
            # 원본을 그대로 복사하거나, output_path를 삭제할 수 있습니다.
            # 여기서는 output_path가 input_path와 다를 경우, 생성된 output_path가 원본과 다를 수 있으므로
            # 사용자가 직접 확인하도록 둡니다. 만약 이 경우 원본을 사용하고 싶다면 output_path를 삭제하고 원본을 복사할 수 있습니다.
            if not overwrite and os.path.exists(output_path) and os.path.getsize(output_path) >= os.path.getsize(input_path):
                print(f"  - 최적화된 파일이 원본보다 크거나 같으므로 원본을 유지하는 것이 좋습니다.")

        elif process.returncode == 99 and os.path.exists(output_path):
            # 코드가 99인 경우는 이미지 품질이 너무 낮아서 pngquant가 처리를 거부했을 때
            # output_path가 원본과 동일하게 저장될 수 있습니다 (이 경우 Pillow처럼 동작)
            # 또는 파일이 생성되지 않을 수도 있습니다.
            print(f"주의 ({os.path.basename(input_path)}): pngquant가 이미지 품질 저하 없이 변환했습니다 (종료 코드 99).")
            print(f"  - 파일 크기 변동이 거의 없거나, 이미지가 이미 팔레트 기반일 수 있습니다.")
            print(f"  - stderr: {process.stderr.strip()}")
        else:
            print(f"오류: pngquant 처리 실패 ({os.path.basename(input_path)}) - 종료 코드: {process.returncode}")
            print(f"  - stderr: {process.stderr.strip()}")
            print(f"  - stdout: {process.stdout.strip()}")
            # 실패 시 생성되었을 수 있는 output_path 파일 삭제 (선택적)
            if os.path.exists(output_path) and not overwrite:
                # 생성된 파일이 비정상적이거나 0바이트일 수 있으므로 확인 후 삭제
                if os.path.getsize(output_path) == 0:
                    os.remove(output_path)
                    print(f"  - 비정상적인 출력 파일 {output_path} 삭제됨")


    except FileNotFoundError:
        print("오류: pngquant를 찾을 수 없습니다. 시스템에 설치되어 있고 PATH에 등록되어 있는지 확인하세요.")
        print("설치 방법:\n- macOS: brew install pngquant\n- Debian/Ubuntu: sudo apt-get install pngquant")
    except Exception as e:
        print(f"Python 스크립트 오류 발생 ({os.path.basename(input_path)}): {e}")
    finally:
        print("-" * 30)


def batch_optimize_pngs_with_pngquant(output_subfolder="pngquant_optimized_pngs", quality_min_max="65-80", speed="3"):
    """
    현재 폴더의 모든 PNG 파일의 용량을 pngquant를 사용하여 줄여 지정된 하위 폴더에 저장합니다.
    """
    current_folder = os.getcwd()
    output_folder_path = os.path.join(current_folder, output_subfolder)

    if not os.path.exists(output_folder_path):
        os.makedirs(output_folder_path)
        print(f"'{output_subfolder}' 폴더를 생성했습니다.")

    found_png_files = False
    for filename in os.listdir(current_folder):
        if filename.lower().endswith(".png"):
            # 자기 자신이 생성한 폴더 내의 파일은 처리하지 않도록 예외 처리
            if os.path.abspath(os.path.join(current_folder, filename)).startswith(os.path.abspath(output_folder_path)):
                continue

            found_png_files = True
            input_path = os.path.join(current_folder, filename)
            output_filename = filename # 원본 파일명 유지
            output_path = os.path.join(output_folder_path, output_filename)

            print(f"'{filename}' 파일 pngquant 최적화 시도...")
            # overwrite=False로 설정하여 output_path에 저장
            optimize_png_with_pngquant(input_path, output_path, quality_min_max=quality_min_max, speed=speed, overwrite=False)

    if not found_png_files:
        print("현재 폴더에서 처리할 PNG 파일을 찾을 수 없습니다 (또는 이미 최적화 폴더에 있습니다).")

# --- 스크립트 실행 부분 ---
if __name__ == "__main__":
    # 최적화된 파일을 저장할 하위 폴더 이름
    optimized_folder_name = "pngquant_optimized_pngs"

    # pngquant 품질 설정 (0-100, min-max 형식)
    # 예: "65-80" -> 최소 65% 품질을 보장하되 80% 품질을 넘지 않도록 시도
    # 더 낮은 값은 더 작은 파일 크기를 의미하지만 화질 손실이 커질 수 있음
    quality_setting = "70-85" # 필요에 따라 조절

    # pngquant 속도 설정 (1-11)
    # 1: 최고 품질, 가장 느림
    # 3: 기본값, 좋은 균형
    # 11: 가장 빠름, 품질 저하 가능성
    speed_setting = "1" # 품질을 우선시 한다면 '1' 또는 '3'

    print(f"현재 폴더의 모든 PNG 파일을 pngquant로 최적화하여 '{optimized_folder_name}' 폴더에 저장합니다.")
    print(f"품질 설정: {quality_setting}, 속도 설정: {speed_setting}")

    batch_optimize_pngs_with_pngquant(
        output_subfolder=optimized_folder_name,
        quality_min_max=quality_setting,
        speed=speed_setting
    )
    print("모든 작업이 완료되었습니다.")